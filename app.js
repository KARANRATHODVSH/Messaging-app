let users = JSON.parse(localStorage.getItem("users")) || [];

function saveUsers() {
    localStorage.setItem("users", JSON.stringify(users));
}

    function renderUsers() {
        const list = document.getElementById("userList");
        list.innerHTML = "";

        users.forEach((u, index) => {
            list.innerHTML += `
                <div class="user-card">
                    <div>
                        <strong>${u.name}</strong><br>
                        ${u.mobile}
                    </div>
                    <button class="delete-btn" onclick="deleteUser(${index})">Delete</button>
                </div>
            `;
        });
    }

    function cleanNumber(num) {
        return num.replace(/\D/g, "");
    }

    function isValidIndianNumber(num) {
        return /^[6-9][0-9]{9}$/.test(num);
    }

    function isValidUsername(name) {
        // Username should be 2-50 characters, letters only, can include spaces
        return /^[a-zA-Z\s]{2,50}$/.test(name.trim());
    }

    function isNumberKey(evt) {
        // Allow only numbers, backspace, delete, tab, escape, and enter
        const charCode = (evt.which) ? evt.which : evt.keyCode;
        if (charCode > 31 && (charCode < 48 || charCode > 57)) {
            return false;
        }
        return true;
    }

    function filterMobileInput(input) {
        // Remove any non-numeric characters
        let value = input.value.replace(/\D/g, '');
        // Limit to 10 digits
        if (value.length > 10) {
            value = value.substring(0, 10);
        }
        input.value = value;
    }

    function isLetterKey(evt) {
        // Allow only letters, space, backspace, delete, tab, escape, and enter
        const charCode = (evt.which) ? evt.which : evt.keyCode;
        // Allow letters (A-Z, a-z), space (32), backspace (8), delete (46), tab (9), escape (27), enter (13)
        if ((charCode >= 65 && charCode <= 90) || (charCode >= 97 && charCode <= 122) || charCode == 32 || charCode <= 13 || charCode == 8 || charCode == 9 || charCode == 27 || charCode == 46) {
            return true;
        }
        return false;
    }

    function filterUsernameInput(input) {
        // Remove any non-letter characters except spaces
        let value = input.value.replace(/[^a-zA-Z\s]/g, '');
        // Limit to 50 characters
        if (value.length > 50) {
            value = value.substring(0, 50);
        }
        input.value = value;
    }

    function handleFileUpload(event) {
        const file = event.target.files[0];
        const fileLabel = document.getElementById('fileLabel');
        const importSummary = document.getElementById('importSummary');
        
        if (!file) {
            fileLabel.textContent = '📁 Choose .txt file or drag here';
            fileLabel.classList.remove('has-file');
            importSummary.style.display = 'none';
            return;
        }

        // Check file type
        if (!file.name.toLowerCase().endsWith('.txt')) {
            showImportSummary('Please upload a .txt file', 'error');
            event.target.value = '';
            return;
        }

        // Check file size (max 5MB)
        if (file.size > 5 * 1024 * 1024) {
            showImportSummary('File size must be less than 5MB', 'error');
            event.target.value = '';
            return;
        }

        fileLabel.textContent = `📄 ${file.name} (${(file.size / 1024).toFixed(1)} KB)`;
        fileLabel.classList.add('has-file');

        // Read file content
        const reader = new FileReader();
        reader.onload = function(e) {
            const content = e.target.result;
            parseAndImportUsers(content);
        };
        reader.onerror = function() {
            showImportSummary('Error reading file', 'error');
            event.target.value = '';
        };
        reader.readAsText(file);
    }

    function parseAndImportUsers(content) {
        const lines = content.split('\n').filter(line => line.trim());
        let importedCount = 0;
        let skippedCount = 0;
        let duplicateCount = 0;
        const newUsers = [];

        lines.forEach((line, index) => {
            // Skip empty lines
            if (!line.trim()) return;

            // Parse line - support formats: "Name,Mobile" or "Name Mobile"
            let name, mobile;
            
            if (line.includes(',')) {
                // Format: Name,Mobile
                const parts = line.split(',').map(part => part.trim());
                if (parts.length >= 2) {
                    name = parts[0];
                    mobile = cleanNumber(parts[1]);
                }
            } else {
                // Format: Name Mobile (space separated)
                const parts = line.trim().split(/\s+/);
                if (parts.length >= 2) {
                    name = parts.slice(0, -1).join(' ');
                    mobile = cleanNumber(parts[parts.length - 1]);
                }
            }

            // Validate parsed data
            if (!name || !mobile) {
                skippedCount++;
                return;
            }

            if (!isValidUsername(name)) {
                skippedCount++;
                return;
            }

            if (!isValidIndianNumber(mobile)) {
                skippedCount++;
                return;
            }

            // Check for duplicates
            const isDuplicate = users.some(user => 
                user.name.toLowerCase() === name.toLowerCase() || user.mobile === mobile
            );
            
            if (isDuplicate) {
                duplicateCount++;
                return;
            }

            // Add to new users list
            newUsers.push({ name, mobile });
            importedCount++;
        });

        // Add new users to the main users array
        users.push(...newUsers);
        saveUsers();
        renderUsers();

        // Show import summary
        let summaryMessage = `✅ Import completed!\n`;
        summaryMessage += `📥 Imported: ${importedCount} users\n`;
        if (skippedCount > 0) {
            summaryMessage += `⚠️ Skipped: ${skippedCount} invalid entries\n`;
        }
        if (duplicateCount > 0) {
            summaryMessage += `🔄 Duplicates: ${duplicateCount} already exist\n`;
        }
        summaryMessage += `📊 Total users: ${users.length}`;

        showImportSummary(summaryMessage, 'success');

        // Reset file input
        setTimeout(() => {
            document.getElementById('fileInput').value = '';
            document.getElementById('fileLabel').textContent = '📁 Choose .txt file or drag here';
            document.getElementById('fileLabel').classList.remove('has-file');
        }, 2000);
    }

    function showImportSummary(message, type) {
        const importSummary = document.getElementById('importSummary');
        importSummary.textContent = message;
        importSummary.className = `import-summary ${type}`;
        importSummary.style.display = 'block';

        // Auto-hide after 5 seconds
        setTimeout(() => {
            importSummary.style.display = 'none';
        }, 5000);
    }

    function validateUsername() {
        const usernameInput = document.getElementById("username");
        const usernameError = document.getElementById("username-error");
        const usernameIcon = document.getElementById("username-icon");
        const username = usernameInput.value.trim();

        // Reset validation states
        usernameInput.classList.remove('input-error', 'input-success');
        usernameIcon.classList.remove('success', 'error');
        usernameError.style.display = 'none';

        if (username === '') {
            usernameIcon.style.display = 'none';
            return false;
        }

        if (!isValidUsername(username)) {
            usernameInput.classList.add('input-error');
            usernameIcon.classList.add('error');
            usernameIcon.innerHTML = '✗';
            usernameError.textContent = 'Name must be 2-50 characters and contain only letters';
            usernameError.style.display = 'block';
            return false;
        }

        // Check for duplicate names
        const isDuplicate = users.some(user => user.name.toLowerCase() === username.toLowerCase());
        if (isDuplicate) {
            usernameInput.classList.add('input-error');
            usernameIcon.classList.add('error');
            usernameIcon.innerHTML = '✗';
            usernameError.textContent = 'This name already exists';
            usernameError.style.display = 'block';
            return false;
        }

        usernameInput.classList.add('input-success');
        usernameIcon.classList.add('success');
        usernameIcon.innerHTML = '✓';
        return true;
    }

    function validateMobile() {
        const mobileInput = document.getElementById("mobile");
        const mobileError = document.getElementById("mobile-error");
        const mobileIcon = document.getElementById("mobile-icon");
        const mobile = cleanNumber(mobileInput.value);

        // Reset validation states
        mobileInput.classList.remove('input-error', 'input-success');
        mobileIcon.classList.remove('success', 'error');
        mobileError.style.display = 'none';

        if (mobileInput.value.trim() === '') {
            mobileIcon.style.display = 'none';
            return false;
        }

        if (mobile.length < 10) {
            mobileInput.classList.add('input-error');
            mobileIcon.classList.add('error');
            mobileIcon.innerHTML = '✗';
            mobileError.textContent = 'Mobile number must be exactly 10 digits';
            mobileError.style.display = 'block';
            return false;
        }

        if (!isValidIndianNumber(mobile)) {
            mobileInput.classList.add('input-error');
            mobileIcon.classList.add('error');
            mobileIcon.innerHTML = '✗';
            mobileError.textContent = 'Invalid Indian mobile number! Must start with 6/7/8/9';
            mobileError.style.display = 'block';
            return false;
        }

        // Check for duplicate mobile numbers
        const isDuplicate = users.some(user => user.mobile === mobile);
        if (isDuplicate) {
            mobileInput.classList.add('input-error');
            mobileIcon.classList.add('error');
            mobileIcon.innerHTML = '✗';
            mobileError.textContent = 'This mobile number already exists';
            mobileError.style.display = 'block';
            return false;
        }

        mobileInput.classList.add('input-success');
        mobileIcon.classList.add('success');
        mobileIcon.innerHTML = '✓';
        return true;
    }

    function addUser() {
        let name = document.getElementById("username").value.trim();
        let mobile = cleanNumber(document.getElementById("mobile").value);

        // Run validation before adding user
        const isUsernameValid = validateUsername();
        const isMobileValid = validateMobile();

        if (!name || !mobile) {
            if (!name) {
                document.getElementById("username-error").textContent = 'Name is required';
                document.getElementById("username-error").style.display = 'block';
                document.getElementById("username").classList.add('input-error');
            }
            if (!mobile) {
                document.getElementById("mobile-error").textContent = 'Mobile number is required';
                document.getElementById("mobile-error").style.display = 'block';
                document.getElementById("mobile").classList.add('input-error');
            }
            return;
        }

        if (!isUsernameValid || !isMobileValid) {
            return;
        }

        users.push({ name, mobile });
        saveUsers();
        renderUsers();

        // Clear form and reset validation states
        document.getElementById("username").value = "";
        document.getElementById("mobile").value = "";
        document.getElementById("username").classList.remove('input-success', 'input-error');
        document.getElementById("mobile").classList.remove('input-success', 'input-error');
        document.getElementById("username-icon").style.display = 'none';
        document.getElementById("mobile-icon").style.display = 'none';
        document.getElementById("username-error").style.display = 'none';
        document.getElementById("mobile-error").style.display = 'none';
    }

    function deleteUser(index) {
        users.splice(index, 1);
        saveUsers();
        renderUsers();
    }

    // Send messages with delay (avoid popup block)
    function sendMessages() {
        const message = encodeURIComponent(document.getElementById("message").value);

        if (users.length === 0) {
            alert("No users added!");
            return;
        }

        if (!message) {
            alert("Please enter a message");
            return;
        }

        let i = 0;

        function openNext() {
            if (i >= users.length) {
                alert("All messages opened!");
                return;
            }

            const u = users[i];
            const url = `https://wa.me/91${u.mobile}?text=${message}`;
            window.open(url, "_blank");

            i++;
            setTimeout(openNext, 1500);
        }

        openNext();
    }

    renderUsers();
