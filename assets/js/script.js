// Spot Recognition Application
// Modular JavaScript with improved user experience

// Data Management Module
class SpotRecognitionData {
    constructor() {
        this.formDataArray = [];
        this.editingIndex = -1; // Track if we're editing
        this.editingData = null; // Store original data during edit
    }

    addEntry(entry) {
        this.formDataArray.push(entry);
    }

    updateEntry(index, entry) {
        if (index >= 0 && index < this.formDataArray.length) {
            this.formDataArray[index] = entry;
        }
    }

    deleteEntry(index) {
        if (index >= 0 && index < this.formDataArray.length) {
            this.formDataArray.splice(index, 1);
        }
    }

    cloneEntry(index) {
        if (index >= 0 && index < this.formDataArray.length) {
            const clonedData = JSON.parse(JSON.stringify(this.formDataArray[index]));
            this.formDataArray.push(clonedData);
        }
    }

    getEntry(index) {
        return this.formDataArray[index] || null;
    }

    getAllEntries() {
        return this.formDataArray;
    }

    setEditMode(index) {
        this.editingIndex = index;
        this.editingData = this.getEntry(index);
    }

    clearEditMode() {
        this.editingIndex = -1;
        this.editingData = null;
    }

    isEditMode() {
        return this.editingIndex >= 0;
    }
}

// Notification System for better user feedback
class NotificationManager {
    constructor() {
        this.createNotificationContainer();
    }

    createNotificationContainer() {
        if (!document.getElementById('notification-container')) {
            const container = document.createElement('div');
            container.id = 'notification-container';
            container.className = 'notification-container';
            document.body.appendChild(container);
        }
    }

    show(message, type = 'info', duration = 3000) {
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.innerHTML = `
            <div class="notification-content">
                <span class="notification-icon">${this.getIcon(type)}</span>
                <span class="notification-message">${message}</span>
                <button class="notification-close" onclick="this.parentElement.parentElement.remove()">×</button>
            </div>
        `;

        const container = document.getElementById('notification-container');
        container.appendChild(notification);

        // Auto remove
        setTimeout(() => {
            if (notification.parentElement) {
                notification.remove();
            }
        }, duration);

        return notification;
    }

    getIcon(type) {
        const icons = {
            success: '✅',
            error: '❌',
            warning: '⚠️',
            info: 'ℹ️'
        };
        return icons[type] || icons.info;
    }

    success(message, duration = 3000) {
        return this.show(message, 'success', duration);
    }

    error(message, duration = 5000) {
        return this.show(message, 'error', duration);
    }

    warning(message, duration = 4000) {
        return this.show(message, 'warning', duration);
    }

    info(message, duration = 3000) {
        return this.show(message, 'info', duration);
    }
}

// Form Management Module with improved UX
class FormManager {
    constructor(dataManager, notificationManager) {
        this.dataManager = dataManager;
        this.notificationManager = notificationManager;
        this.form = document.getElementById('sr_form');
        this.initializeForm();
        this.setupValidation();
    }

    initializeForm() {
        // Override form reset to handle edit mode
        const originalReset = this.form.reset.bind(this.form);
        this.form.reset = () => {
            originalReset();
            this.clearEditIndicator();
            this.dataManager.clearEditMode();
            this.clearValidationErrors();
            this.resetFileInputPlaceholders();
            badgeMultiSelect.reset(); // Reset badge selection
        };

        // Add loading state management
        this.submitButton = this.form.querySelector('button[type="button"]');
        this.originalSubmitText = this.submitButton.textContent;
    }

    resetFileInputPlaceholders() {
        const fileWrappers = this.form.querySelectorAll('.file-input-wrapper');
        fileWrappers.forEach(wrapper => {
            const fileInput = wrapper.querySelector('input[type="file"]');
            const fileTextElement = wrapper.querySelector('.file-text');
            
            // Reset to original text and style
            if (fileInput.id === 'left_image') {
                fileTextElement.textContent = 'Choose left image';
            } else {
                fileTextElement.textContent = 'Choose right images';
            }
            wrapper.classList.remove('has-files');
        });
    }

    setupValidation() {
        // Real-time validation
        const inputs = this.form.querySelectorAll('input[type="text"]');
        inputs.forEach(input => {
            input.addEventListener('blur', () => this.validateField(input));
            input.addEventListener('input', () => this.clearFieldError(input));
        });

        // File input validation
        const fileInputs = this.form.querySelectorAll('input[type="file"]');
        fileInputs.forEach(input => {
            input.addEventListener('change', () => this.validateFileInput(input));
        });

        // Setup custom file input handlers
        this.setupFileInputs();
    }

    setupFileInputs() {
        // Handle custom file input clicks
        const fileWrappers = this.form.querySelectorAll('.file-input-wrapper');
        fileWrappers.forEach(wrapper => {
            const fileInput = wrapper.querySelector('input[type="file"]');
            const placeholder = wrapper.querySelector('.file-input-placeholder');
            
            // Make placeholder clickable
            placeholder.addEventListener('click', () => {
                fileInput.click();
            });

            // Update placeholder text when files are selected
            fileInput.addEventListener('change', () => {
                this.updateFileInputPlaceholder(fileInput, placeholder);
            });
        });
    }

    updateFileInputPlaceholder(fileInput, placeholder) {
        const fileTextElement = placeholder.querySelector('.file-text');
        const files = fileInput.files;
        const wrapper = fileInput.closest('.file-input-wrapper');
        
        if (files && files.length > 0) {
            if (files.length === 1) {
                fileTextElement.textContent = files[0].name;
            } else {
                fileTextElement.textContent = `${files.length} files selected`;
            }
            wrapper.classList.add('has-files');
        } else {
            // Reset to original text
            if (fileInput.id === 'left_image') {
                fileTextElement.textContent = 'Choose left image';
            } else {
                fileTextElement.textContent = 'Choose right images';
            }
            wrapper.classList.remove('has-files');
        }
    }

    validateField(input) {
        const value = input.value.trim();
        const fieldName = input.getAttribute('name');
        
        if (!value && !this.dataManager.isEditMode()) {
            this.showFieldError(input, `${this.getFieldLabel(fieldName)} is required`);
            return false;
        }
        
        this.clearFieldError(input);
        return true;
    }

    validateFileInput(input) {
        const files = input.files;
        const fieldName = input.getAttribute('name');
        
        if (fieldName === 'leftImage' && (!files || files.length === 0) && !this.dataManager.isEditMode()) {
            this.showFieldError(input, 'Left image is required');
            return false;
        }

        // Validate file types
        if (files) {
            for (let file of files) {
                if (!file.type.startsWith('image/')) {
                    this.showFieldError(input, 'Please select only image files');
                    return false;
                }
                if (file.size > 5 * 1024 * 1024) { // 5MB limit
                    this.showFieldError(input, 'Image size should be less than 5MB');
                    return false;
                }
            }
        }

        this.clearFieldError(input);
        return true;
    }

    showFieldError(input, message) {
        this.clearFieldError(input);
        const errorDiv = document.createElement('div');
        errorDiv.className = 'field-error';
        errorDiv.textContent = message;
        input.parentElement.appendChild(errorDiv);
        input.classList.add('error');
    }

    clearFieldError(input) {
        const errorDiv = input.parentElement.querySelector('.field-error');
        if (errorDiv) errorDiv.remove();
        input.classList.remove('error');
    }

    clearValidationErrors() {
        const errors = this.form.querySelectorAll('.field-error');
        errors.forEach(error => error.remove());
        const errorInputs = this.form.querySelectorAll('.error');
        errorInputs.forEach(input => input.classList.remove('error'));
    }

    getFieldLabel(fieldName) {
        const labels = {
            spotWinnerName: 'Winner Name',
            description: 'Description',
            spotSenderName: 'Sender Name',
            leftImage: 'Left Image'
        };
        return labels[fieldName] || fieldName;
    }

    async submitForm() {
        try {
            // Show loading state
            this.setSubmitLoading(true);

            // Validate form
            if (!this.validateForm()) {
                this.setSubmitLoading(false);
                return;
            }

            const formData = new FormData(this.form);
            const leftImageFile = formData.get('leftImage');
            const selectedBadges = badgeMultiSelect.getSelectedBadges();

            let leftImageBase64;

            // Handle edit mode - use existing images if no new images uploaded
            if (this.dataManager.isEditMode()) {
                const editingData = this.dataManager.editingData;
                
                // Use existing left image if no new one uploaded
                if (leftImageFile && leftImageFile.size > 0) {
                    leftImageBase64 = await this.readFileAsDataURL(leftImageFile);
                } else {
                    leftImageBase64 = editingData.leftImage;
                }
            } else {
                // New entry mode - require images
                if (!leftImageFile || leftImageFile.size === 0) {
                    this.notificationManager.error('Please select a left image');
                    this.setSubmitLoading(false);
                    return;
                }
                
                leftImageBase64 = await this.readFileAsDataURL(leftImageFile);
            }

            // Validate badges selection
            if (selectedBadges.length === 0) {
                this.notificationManager.error('Please select at least one badge');
                this.setSubmitLoading(false);
                return;
            }

            const formObject = {
                leftImage: leftImageBase64,
                spotWinnerName: formData.get('spotWinnerName'),
                description: formData.get('description'),
                spotSenderName: formData.get('spotSenderName'),
                selectedBadges: selectedBadges
            };

            if (this.dataManager.isEditMode()) {
                this.dataManager.updateEntry(this.dataManager.editingIndex, formObject);
                this.dataManager.clearEditMode();
                this.notificationManager.success('Entry updated successfully!');
            } else {
                this.dataManager.addEntry(formObject);
                this.notificationManager.success('Entry added successfully!');
            }

            tableManager.updateTable();
            this.form.reset();
            this.clearEditIndicator();
            this.setSubmitLoading(false);

        } catch (error) {
            console.error('Error submitting form:', error);
            this.notificationManager.error('Error processing form. Please try again.');
            this.setSubmitLoading(false);
        }
    }

    validateForm() {
        let isValid = true;
        const inputs = this.form.querySelectorAll('input[type="text"]');
        
        inputs.forEach(input => {
            if (!this.validateField(input)) {
                isValid = false;
            }
        });

        const fileInputs = this.form.querySelectorAll('input[type="file"]');
        fileInputs.forEach(input => {
            if (!this.validateFileInput(input)) {
                isValid = false;
            }
        });

        return isValid;
    }

    setSubmitLoading(loading) {
        if (loading) {
            this.submitButton.textContent = 'Processing...';
            this.submitButton.disabled = true;
            this.submitButton.classList.add('loading');
        } else {
            this.submitButton.textContent = this.originalSubmitText;
            this.submitButton.disabled = false;
            this.submitButton.classList.remove('loading');
        }
    }

    readFileAsDataURL(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = (e) => resolve(e.target.result);
            reader.onerror = reject;
            reader.readAsDataURL(file);
        });
    }

    async readMultipleFiles(files) {
        const promises = [];
        files.forEach(file => {
            if (file && file.size > 0) {
                promises.push(this.readFileAsDataURL(file));
            }
        });
        return Promise.all(promises);
    }

    populateFormForEdit(data) {
        document.getElementById('spot_winner_name').value = data.spotWinnerName || '';
        document.getElementById('spot_description').value = data.description || '';
        document.getElementById('spot_sender_name').value = data.spotSenderName || '';
        
        // Populate badges if they exist
        if (data.selectedBadges && data.selectedBadges.length > 0) {
            badgeMultiSelect.setSelectedBadges(data.selectedBadges);
        } else {
            badgeMultiSelect.reset();
        }
        
        this.showEditIndicator();
        this.scrollToForm();
    }

    showEditIndicator() {
        this.clearEditIndicator();
        const editIndicator = document.createElement('div');
        editIndicator.className = 'edit-indicator';
        editIndicator.innerHTML = `
            <div class="edit-indicator-content">
                <span class="edit-icon">✏️</span>
                <div>
                    <strong>Editing Mode</strong>
                    <p>Images will be preserved if not changed</p>
                </div>
                <button type="button" class="cancel-edit-btn" onclick="cancelEdit()">Cancel</button>
            </div>
        `;
        this.form.insertBefore(editIndicator, this.form.firstChild);
    }

    clearEditIndicator() {
        const indicator = this.form.querySelector('.edit-indicator');
        if (indicator) indicator.remove();
    }

    scrollToForm() {
        document.querySelector('.sr-form').scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
}

// Table Management Module with improved UX
class TableManager {
    constructor(dataManager, notificationManager) {
        this.dataManager = dataManager;
        this.notificationManager = notificationManager;
        this.tableBody = document.querySelector('.table-body');
    }

    updateTable() {
        this.tableBody.innerHTML = '';
        const entries = this.dataManager.getAllEntries();
        
        // Update entry count
        this.updateEntryCount(entries.length);
        
        if (entries.length === 0) {
            this.showEmptyState();
        } else {
            entries.forEach((data, index) => {
                const row = this.createTableRow(data, index);
                this.tableBody.appendChild(row);
            });
        }
    }

    updateEntryCount(count) {
        const entryCountElement = document.getElementById('entry-count');
        if (entryCountElement) {
            entryCountElement.textContent = `${count} ${count === 1 ? 'entry' : 'entries'}`;
        }
    }

    showEmptyState() {
        const row = document.createElement('tr');
        row.className = 'empty-state';
        row.innerHTML = `
            <td colspan="7" class="empty-state-content">
                <div class="empty-state-icon">📝</div>
                <h3>No entries yet</h3>
                <p>Add your first spot recognition entry using the form on the left</p>
            </td>
        `;
        this.tableBody.appendChild(row);
    }

    createTableRow(data, index) {
        const row = document.createElement('tr');
        row.className = 'data-row';
        const badgesHtml = this.createBadgesHTML(data.selectedBadges);

        row.innerHTML = `
            <td class="sr-no">${index + 1}</td>
            <td class="image-cell">
                <img src="${data.leftImage}" alt="Left Image" class="table-image" onclick="showImageModal('${data.leftImage}', 'Left Image')">
            </td>
            <td class="winner-name">${data.spotWinnerName}</td>
            <td class="description">${data.description}</td>
            <td class="sender-name">${data.spotSenderName}</td>
            <td class="badges-cell">${badgesHtml}</td>
            <td class="actions-cell">
                <div class="action-buttons">
                    <button class="action-btn edit-btn" onclick="editRow(${index})" title="Edit Entry">
                        <span class="btn-icon">✏️</span>
                        <span class="btn-text">Edit</span>
                    </button>
                    <button class="action-btn clone-btn" onclick="cloneRow(${index})" title="Clone Entry">
                        <span class="btn-icon">📋</span>
                        <span class="btn-text">Clone</span>
                    </button>
                    <button class="action-btn delete-btn" onclick="confirmDelete(${index})" title="Delete Entry">
                        <span class="btn-icon">🗑️</span>
                        <span class="btn-text">Delete</span>
                    </button>
                </div>
            </td>
        `;

        return row;
    }

    createBadgesHTML(selectedBadges) {
        if (!selectedBadges || selectedBadges.length === 0) {
            return '<span class="no-badges">No badges</span>';
        }
        return selectedBadges.map((badge, index) => 
            `<img src="${badge.imagePath}" alt="${badge.label}" class="table-badge-image" title="${badge.label}">`
        ).join('');
    }
}

// Image Generation Module with enhanced progress tracking
class ImageGenerator {
    constructor(dataManager, notificationManager) {
        this.dataManager = dataManager;
        this.notificationManager = notificationManager;
        this.progressContainer = document.getElementById('progress-container');
        this.progressFill = document.getElementById('progress-fill');
        this.progressText = document.getElementById('progress-text');
        this.successMessage = document.getElementById('success-message');
        this.generateButton = document.querySelector('button[onclick="generateImage()"]');
    }

    async generateImage() {
        try {
            // Validate dates
            const startDate = document.getElementById('start_date').value;
            const endDate = document.getElementById('end_date').value;

            if (!startDate || !endDate) {
                this.notificationManager.warning('Please select both start and end dates');
                return;
            }

            if (new Date(startDate) > new Date(endDate)) {
                this.notificationManager.error('Start date cannot be after end date');
                return;
            }

            if (this.dataManager.getAllEntries().length === 0) {
                this.notificationManager.warning('Please add at least one entry before generating image');
                return;
            }

            this.setGenerateLoading(true);
            this.showProgress();
            this.updateDateSection();
            this.createMediaObjects();
            await this.processImageGeneration();
        } catch (error) {
            console.error('Error generating image:', error);
            this.hideProgress();
            this.setGenerateLoading(false);
            this.notificationManager.error('Error generating image. Please try again.');
        }
    }

    setGenerateLoading(loading) {
        if (loading) {
            this.generateButton.textContent = 'Generating...';
            this.generateButton.disabled = true;
            this.generateButton.classList.add('loading');
        } else {
            this.generateButton.textContent = 'Generate Image';
            this.generateButton.disabled = false;
            this.generateButton.classList.remove('loading');
        }
    }

    showProgress() {
        this.progressContainer.style.display = 'block';
        this.successMessage.style.display = 'none';
        this.progressFill.style.width = '0%';
        this.progressText.textContent = 'Preparing image...';
    }

    hideProgress() {
        this.progressContainer.style.display = 'none';
    }

    updateProgress(percentage, text) {
        this.progressFill.style.width = `${percentage}%`;
        this.progressText.textContent = text;
    }

    updateDateSection() {
        const startDate = document.getElementById('start_date').value;
        const endDate = document.getElementById('end_date').value;
        const dateSection = document.querySelector('#date_section');
        
        if (startDate && endDate) {
            const formattedStartDate = this.formatDate(startDate);
            const formattedEndDate = this.formatDate(endDate);
            dateSection.textContent = `${formattedStartDate} - ${formattedEndDate}`;
        }
    }

    createMediaObjects() {
        const mediaContainer = document.getElementById('mediaContainer');
        mediaContainer.innerHTML = '';
        
        this.dataManager.getAllEntries().forEach(data => {
            const mediaObject = this.createMediaObject(data);
            mediaContainer.appendChild(mediaObject);
        });
    }

    createMediaObject(data) {
        const mediaObject = document.createElement('div');
        mediaObject.className = 'media-object';

        const leftImage = this.createElement('img', {
            src: data.leftImage,
            alt: 'Left Image',
            className: 'left-image'
        });

        const mediaContent = this.createMediaContent(data);
        const badgesContainer = this.createBadgesContainer(data.selectedBadges);

        mediaObject.appendChild(leftImage);
        mediaObject.appendChild(mediaContent);
        mediaObject.appendChild(badgesContainer);

        return mediaObject;
    }

    createMediaContent(data) {
        const mediaContent = this.createElement('div', { className: 'media-content' });
        
        const winnerName = this.createElement('h3', { textContent: data.spotWinnerName });
        const description = this.createElement('p', { textContent: data.description });
        const senderName = this.createElement('p', { 
            className: 'send-by',
            textContent: `- ${data.spotSenderName}`
        });

        mediaContent.appendChild(winnerName);
        mediaContent.appendChild(description);
        mediaContent.appendChild(senderName);

        return mediaContent;
    }

    createBadgesContainer(selectedBadges) {
        const container = this.createElement('div', { className: 'badges-container' });
        
        if (selectedBadges && selectedBadges.length > 0) {
            selectedBadges.forEach(badge => {
                const badgeImage = this.createElement('img', {
                    src: badge.imagePath,
                    alt: badge.label,
                    className: 'media-badge-image',
                    title: badge.label
                });
                
                container.appendChild(badgeImage);
            });
        }

        return container;
    }

    createElement(tag, attributes = {}) {
        const element = document.createElement(tag);
        Object.keys(attributes).forEach(key => {
            if (key === 'textContent') {
                element.textContent = attributes[key];
            } else {
                element[key] = attributes[key];
            }
        });
        return element;
    }

    async processImageGeneration() {
        const progressSteps = [
            { percentage: 30, text: 'Processing content...', delay: 500 },
            { percentage: 60, text: 'Generating image...', delay: 1000 },
            { percentage: 90, text: 'Finalizing download...', delay: 1500 }
        ];

        for (const step of progressSteps) {
            await this.delay(step.delay);
            this.updateProgress(step.percentage, step.text);
        }

        const canvas = await html2canvas(document.querySelector("#email_image"));
        this.downloadImage(canvas);
        
        this.updateProgress(100, 'Complete!');
        await this.delay(500);
        
        this.hideProgress();
        this.setGenerateLoading(false);
        this.notificationManager.success('Image downloaded successfully!');
    }

    downloadImage(canvas) {
        const link = document.createElement('a');
        const date = new Date().toISOString().split('T')[0];
        link.download = `spot_recognition_${date}.png`;
        link.href = canvas.toDataURL();
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }

    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    formatDate(dateString) {
        const options = { day: 'numeric', month: 'long', year: 'numeric' };
        const date = new Date(dateString);
        return date.toLocaleDateString('en-GB', options).replace(/ /g, ' ').replace(/,/, '');
    }
}

// Modal Management for image preview
class ModalManager {
    constructor() {
        this.createModal();
    }

    createModal() {
        const modal = document.createElement('div');
        modal.id = 'imageModal';
        modal.className = 'image-modal';
        modal.innerHTML = `
            <div class="modal-content">
                <span class="modal-close">&times;</span>
                <img class="modal-image" src="" alt="">
                <div class="modal-caption"></div>
            </div>
        `;
        document.body.appendChild(modal);

        // Close modal events
        modal.querySelector('.modal-close').addEventListener('click', () => this.hideModal());
        modal.addEventListener('click', (e) => {
            if (e.target === modal) this.hideModal();
        });

        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') this.hideModal();
        });
    }

    showModal(imageSrc, caption) {
        const modal = document.getElementById('imageModal');
        const modalImage = modal.querySelector('.modal-image');
        const modalCaption = modal.querySelector('.modal-caption');
        
        modalImage.src = imageSrc;
        modalCaption.textContent = caption;
        modal.style.display = 'block';
        document.body.style.overflow = 'hidden';
    }

    hideModal() {
        const modal = document.getElementById('imageModal');
        modal.style.display = 'none';
        document.body.style.overflow = 'auto';
    }
}

// Badge Multi-Select Manager
class BadgeMultiSelectManager {
    constructor() {
        this.selectedBadges = [];
        this.isOpen = false;
        this.dropdown = document.getElementById('badge_dropdown');
        this.display = document.querySelector('.badge-multiselect-display');
        this.placeholder = document.querySelector('.badge-placeholder');
        this.selectedContainer = document.getElementById('selected_badges');
        
        this.initializeEventListeners();
    }

    initializeEventListeners() {
        // Close dropdown when clicking outside
        document.addEventListener('click', (e) => {
            if (!e.target.closest('.badge-multiselect')) {
                this.closeDropdown();
            }
        });

        // Handle badge option clicks
        this.dropdown.addEventListener('click', (e) => {
            e.stopPropagation();
            const option = e.target.closest('.badge-option');
            if (option) {
                this.toggleBadge(option);
            }
        });
    }

    toggleDropdown() {
        if (this.isOpen) {
            this.closeDropdown();
        } else {
            this.openDropdown();
        }
    }

    openDropdown() {
        this.isOpen = true;
        this.dropdown.classList.add('show');
        this.display.classList.add('active');
    }

    closeDropdown() {
        this.isOpen = false;
        this.dropdown.classList.remove('show');
        this.display.classList.remove('active');
    }

    toggleBadge(option) {
        const value = option.dataset.value;
        const image = option.dataset.image;
        const label = option.querySelector('.badge-label').textContent;
        
        if (this.selectedBadges.find(badge => badge.value === value)) {
            this.removeBadge(value);
        } else {
            this.addBadge({ value, image, label });
        }
        
        this.updateDisplay();
        this.updateSelectedBadges();
    }

    addBadge(badge) {
        this.selectedBadges.push(badge);
        const option = this.dropdown.querySelector(`[data-value="${badge.value}"]`);
        option.classList.add('selected');
        option.querySelector('.badge-checkbox').textContent = '☑';
    }

    removeBadge(value) {
        this.selectedBadges = this.selectedBadges.filter(badge => badge.value !== value);
        const option = this.dropdown.querySelector(`[data-value="${value}"]`);
        option.classList.remove('selected');
        option.querySelector('.badge-checkbox').textContent = '☐';
    }

    removeBadgeByIndex(index) {
        if (index >= 0 && index < this.selectedBadges.length) {
            const badge = this.selectedBadges[index];
            this.removeBadge(badge.value);
            this.updateDisplay();
            this.updateSelectedBadges();
        }
    }

    updateDisplay() {
        if (this.selectedBadges.length === 0) {
            this.placeholder.textContent = 'Choose badges...';
            this.placeholder.classList.remove('has-selection');
        } else {
            const count = this.selectedBadges.length;
            this.placeholder.textContent = `${count} badge${count > 1 ? 's' : ''} selected`;
            this.placeholder.classList.add('has-selection');
        }
    }

    updateSelectedBadges() {
        this.selectedContainer.innerHTML = '';
        
        this.selectedBadges.forEach((badge, index) => {
            const selectedBadge = document.createElement('div');
            selectedBadge.className = 'selected-badge';
            selectedBadge.innerHTML = `
                <img src="./assets/images/${badge.image}" alt="${badge.label}" class="selected-badge-icon">
                <span>${badge.label}</span>
                <button type="button" class="selected-badge-remove" onclick="badgeMultiSelect.removeBadgeByIndex(${index})">×</button>
            `;
            this.selectedContainer.appendChild(selectedBadge);
        });
    }

    getSelectedBadges() {
        return this.selectedBadges.map(badge => ({
            value: badge.value,
            image: badge.image,
            label: badge.label,
            imagePath: `./assets/images/${badge.image}`
        }));
    }

    setSelectedBadges(badges) {
        // Clear current selection
        this.selectedBadges = [];
        this.dropdown.querySelectorAll('.badge-option').forEach(option => {
            option.classList.remove('selected');
            option.querySelector('.badge-checkbox').textContent = '☐';
        });

        // Set new selection
        badges.forEach(badge => {
            this.addBadge(badge);
        });

        this.updateDisplay();
        this.updateSelectedBadges();
    }

    reset() {
        this.selectedBadges = [];
        this.dropdown.querySelectorAll('.badge-option').forEach(option => {
            option.classList.remove('selected');
            option.querySelector('.badge-checkbox').textContent = '☐';
        });
        this.updateDisplay();
        this.updateSelectedBadges();
    }
}

// Initialize all modules
const notificationManager = new NotificationManager();
const dataManager = new SpotRecognitionData();
const badgeMultiSelect = new BadgeMultiSelectManager();
const formManager = new FormManager(dataManager, notificationManager);
const tableManager = new TableManager(dataManager, notificationManager);
const imageGenerator = new ImageGenerator(dataManager, notificationManager);
const modalManager = new ModalManager();

// Global functions for HTML event handlers
function submitForm() {
    formManager.submitForm();
}

function deleteRow(index) {
    dataManager.deleteEntry(index);
    tableManager.updateTable();
    notificationManager.success('Entry deleted successfully');
}

function cloneRow(index) {
    dataManager.cloneEntry(index);
    tableManager.updateTable();
    notificationManager.success('Entry cloned successfully');
}

function editRow(index) {
    const data = dataManager.getEntry(index);
    if (data) {
        dataManager.setEditMode(index);
        formManager.populateFormForEdit(data);
        tableManager.updateTable();
    }
}

function cancelEdit() {
    dataManager.clearEditMode();
    formManager.clearEditIndicator();
    formManager.form.reset();
    notificationManager.info('Edit cancelled');
}

function confirmDelete(index) {
    const data = dataManager.getEntry(index);
    if (confirm(`Are you sure you want to delete the entry for "${data.spotWinnerName}"?`)) {
        deleteRow(index);
    }
}

function generateImage() {
    imageGenerator.generateImage();
}

function showImageModal(imageSrc, caption) {
    modalManager.showModal(imageSrc, caption);
}



// Global function for dropdown toggle
function toggleBadgeDropdown() {
    badgeMultiSelect.toggleDropdown();
}

// Initialize table on page load
document.addEventListener('DOMContentLoaded', () => {
    tableManager.updateTable();
    notificationManager.info('Welcome to Spot Recognition! Start by adding your first entry.');
});
