// Spot Recognition Application

// Data Management
class SpotRecognitionData {
    constructor() {
        this.formDataArray = [];
        this.editingIndex = -1;
        this.editingData = null;
    }

    addEntry(entry) { this.formDataArray.push(entry); }

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
            this.formDataArray.push(JSON.parse(JSON.stringify(this.formDataArray[index])));
        }
    }

    getEntry(index) { return this.formDataArray[index] || null; }
    getAllEntries() { return this.formDataArray; }

    setEditMode(index) {
        this.editingIndex = index;
        this.editingData = this.getEntry(index);
    }

    clearEditMode() {
        this.editingIndex = -1;
        this.editingData = null;
    }

    isEditMode() { return this.editingIndex >= 0; }
}

// Notifications
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
        document.getElementById('notification-container').appendChild(notification);
        setTimeout(() => { if (notification.parentElement) notification.remove(); }, duration);
        return notification;
    }

    getIcon(type) {
        return { success: '✓', error: '✕', warning: '!', info: 'i' }[type] || 'i';
    }

    success(message, duration = 3000) { return this.show(message, 'success', duration); }
    error(message, duration = 5000)   { return this.show(message, 'error', duration); }
    warning(message, duration = 4000) { return this.show(message, 'warning', duration); }
    info(message, duration = 3000)    { return this.show(message, 'info', duration); }
}

// Form Management
class FormManager {
    constructor(dataManager, notificationManager) {
        this.dataManager = dataManager;
        this.notificationManager = notificationManager;
        this.form = document.getElementById('sr_form');
        this.initializeForm();
        this.setupValidation();
    }

    initializeForm() {
        const originalReset = this.form.reset.bind(this.form);
        this.form.reset = () => {
            originalReset();
            this.clearEditIndicator();
            this.dataManager.clearEditMode();
            this.clearValidationErrors();
            this.resetFileInputPlaceholders();
            badgeMultiSelect.reset();
        };
        this.submitButton = this.form.querySelector('button[type="button"]');
        this.originalSubmitText = this.submitButton.textContent;
    }

    resetFileInputPlaceholders() {
        const fileWrappers = this.form.querySelectorAll('.file-input-wrapper');
        fileWrappers.forEach(wrapper => {
            const fileInput = wrapper.querySelector('input[type="file"]');
            const fileTextElement = wrapper.querySelector('.file-text');
            fileTextElement.textContent = 'Choose photo';
            wrapper.classList.remove('has-files');
        });
    }

    setupValidation() {
        const inputs = this.form.querySelectorAll('input[type="text"]');
        inputs.forEach(input => {
            input.addEventListener('blur', () => this.validateField(input));
            input.addEventListener('input', () => this.clearFieldError(input));
        });

        const fileInputs = this.form.querySelectorAll('input[type="file"]');
        fileInputs.forEach(input => {
            input.addEventListener('change', () => this.validateFileInput(input));
        });

        this.setupFileInputs();
    }

    setupFileInputs() {
        const fileWrappers = this.form.querySelectorAll('.file-input-wrapper');
        fileWrappers.forEach(wrapper => {
            const fileInput = wrapper.querySelector('input[type="file"]');
            const placeholder = wrapper.querySelector('.file-input-placeholder');

            placeholder.addEventListener('click', () => fileInput.click());

            fileInput.addEventListener('change', () => {
                this.updateFileInputPlaceholder(fileInput, placeholder);
            });
        });
    }

    updateFileInputPlaceholder(fileInput, placeholder) {
        const fileTextElement = placeholder.querySelector('.file-text');
        const wrapper = fileInput.closest('.file-input-wrapper');
        const files = fileInput.files;

        if (files && files.length > 0) {
            fileTextElement.textContent = files.length === 1 ? files[0].name : `${files.length} files selected`;
            wrapper.classList.add('has-files');
        } else {
            fileTextElement.textContent = 'Choose photo';
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
            this.showFieldError(input, 'Winner photo is required');
            return false;
        }
        if (files) {
            for (let file of files) {
                if (!file.type.startsWith('image/')) {
                    this.showFieldError(input, 'Please select an image file');
                    return false;
                }
                if (file.size > 5 * 1024 * 1024) {
                    this.showFieldError(input, 'Image must be under 5MB');
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
        this.form.querySelectorAll('.field-error').forEach(e => e.remove());
        this.form.querySelectorAll('.error').forEach(e => e.classList.remove('error'));
    }

    getFieldLabel(fieldName) {
        return { spotWinnerName: 'Winner name', description: 'Recognition', spotSenderName: 'Given by', leftImage: 'Winner photo' }[fieldName] || fieldName;
    }

    async submitForm() {
        try {
            this.setSubmitLoading(true);
            if (!this.validateForm()) { this.setSubmitLoading(false); return; }

            const formData = new FormData(this.form);
            const leftImageFile = formData.get('leftImage');
            const selectedBadges = badgeMultiSelect.getSelectedBadges();

            let leftImageBase64;
            if (this.dataManager.isEditMode()) {
                leftImageBase64 = (leftImageFile && leftImageFile.size > 0)
                    ? await this.readFileAsDataURL(leftImageFile)
                    : this.dataManager.editingData.leftImage;
            } else {
                if (!leftImageFile || leftImageFile.size === 0) {
                    this.notificationManager.error('Please select a winner photo');
                    this.setSubmitLoading(false);
                    return;
                }
                leftImageBase64 = await this.readFileAsDataURL(leftImageFile);
            }

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
                selectedBadges
            };

            if (this.dataManager.isEditMode()) {
                this.dataManager.updateEntry(this.dataManager.editingIndex, formObject);
                this.dataManager.clearEditMode();
                this.notificationManager.success('Entry updated');
            } else {
                this.dataManager.addEntry(formObject);
                this.notificationManager.success('Entry added');
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
        this.form.querySelectorAll('input[type="text"]').forEach(input => {
            if (!this.validateField(input)) isValid = false;
        });
        this.form.querySelectorAll('input[type="file"]').forEach(input => {
            if (!this.validateFileInput(input)) isValid = false;
        });
        return isValid;
    }

    setSubmitLoading(loading) {
        if (loading) {
            this.submitButton.textContent = 'Adding...';
            this.submitButton.disabled = true;
        } else {
            this.submitButton.textContent = 'Add Entry';
            this.submitButton.disabled = false;
        }
    }

    readFileAsDataURL(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = e => resolve(e.target.result);
            reader.onerror = reject;
            reader.readAsDataURL(file);
        });
    }

    populateFormForEdit(data) {
        document.getElementById('spot_winner_name').value = data.spotWinnerName || '';
        document.getElementById('spot_description').value = data.description || '';
        document.getElementById('spot_sender_name').value = data.spotSenderName || '';
        if (data.selectedBadges && data.selectedBadges.length > 0) {
            badgeMultiSelect.setSelectedBadges(data.selectedBadges);
        } else {
            badgeMultiSelect.reset();
        }
        this.showEditIndicator();
    }

    showEditIndicator() {
        this.clearEditIndicator();
        const indicator = document.createElement('div');
        indicator.className = 'edit-indicator';
        indicator.innerHTML = `
            <div class="edit-indicator-content">
                <span class="edit-icon">✏</span>
                <div>
                    <strong>Editing entry</strong>
                    <p>Photo preserved if not changed</p>
                </div>
                <button type="button" class="cancel-edit-btn" onclick="cancelEdit()">Cancel</button>
            </div>
        `;
        this.form.insertBefore(indicator, this.form.firstChild);
    }

    clearEditIndicator() {
        const indicator = this.form.querySelector('.edit-indicator');
        if (indicator) indicator.remove();
    }
}

// Table Management
class TableManager {
    constructor(dataManager, notificationManager) {
        this.dataManager = dataManager;
        this.notificationManager = notificationManager;
        this.tableBody = document.querySelector('.table-body');
    }

    updateTable() {
        this.tableBody.innerHTML = '';
        const entries = this.dataManager.getAllEntries();
        this.updateEntryCount(entries.length);
        if (entries.length === 0) {
            this.showEmptyState();
        } else {
            entries.forEach((data, index) => {
                this.tableBody.appendChild(this.createTableRow(data, index));
            });
        }
    }

    updateEntryCount(count) {
        const el = document.getElementById('entry-count');
        if (el) el.textContent = `${count} ${count === 1 ? 'entry' : 'entries'}`;
    }

    showEmptyState() {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td colspan="7" class="empty-state-content">
                <span class="empty-state-icon">🏅</span>
                <h3>No entries yet</h3>
                <p>Use the form to add your first spot recognition entry</p>
            </td>
        `;
        this.tableBody.appendChild(row);
    }

    createTableRow(data, index) {
        const row = document.createElement('tr');
        row.className = 'data-row';
        row.style.setProperty('--stagger', `${Math.min(index * 0.05, 0.4)}s`);
        const badgesHtml = this.createBadgesHTML(data.selectedBadges);

        row.innerHTML = `
            <td class="sr-no">${index + 1}</td>
            <td class="image-cell">
                <img src="${data.leftImage}" alt="Winner photo" class="table-image" onclick="showImageModal('${data.leftImage}', '${data.spotWinnerName}')">
            </td>
            <td class="winner-name">${this.esc(data.spotWinnerName)}</td>
            <td class="description" title="${this.esc(data.description)}">${this.esc(data.description)}</td>
            <td class="sender-name">${this.esc(data.spotSenderName)}</td>
            <td class="badges-cell">${badgesHtml}</td>
            <td class="actions-cell">
                <div class="action-buttons">
                    <button class="action-btn edit-btn" onclick="editRow(${index})" title="Edit">
                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                    </button>
                    <button class="action-btn clone-btn" onclick="cloneRow(${index})" title="Clone">
                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>
                    </button>
                    <button class="action-btn delete-btn" onclick="confirmDelete(${index})" title="Delete">
                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6M14 11v6"/><path d="M9 6V4h6v2"/></svg>
                    </button>
                </div>
            </td>
        `;
        return row;
    }

    createBadgesHTML(selectedBadges) {
        if (!selectedBadges || selectedBadges.length === 0) return '<span class="no-badges">—</span>';
        return selectedBadges.map(badge =>
            `<img src="${badge.imagePath}" alt="${badge.label}" class="table-badge-image" title="${badge.label}">`
        ).join('');
    }

    esc(str) {
        return String(str || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
    }
}

// Image Generation
class ImageGenerator {
    constructor(dataManager, notificationManager) {
        this.dataManager = dataManager;
        this.notificationManager = notificationManager;
        this.generateButton = null;
    }

    async generateImage() {
        this.generateButton = document.querySelector('.btn-generate');

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
            this.notificationManager.warning('Add at least one entry before generating');
            return;
        }

        try {
            this.setGenerateLoading(true);
            this.updateDateSection();
            this.createMediaObjects();
            await this.processImageGeneration();
        } catch (error) {
            console.error('Error generating image:', error);
            this.setGenerateLoading(false);
            this.notificationManager.error('Error generating image. Please try again.');
        }
    }

    setGenerateLoading(loading) {
        if (!this.generateButton) return;
        this.generateButton.disabled = loading;
        if (loading) {
            this.generateButton.classList.add('loading');
        } else {
            this.generateButton.classList.remove('loading');
        }
    }

    updateDateSection() {
        const startDate = document.getElementById('start_date').value;
        const endDate = document.getElementById('end_date').value;
        if (startDate && endDate) {
            document.querySelector('#date_section').textContent =
                `${this.formatDate(startDate)} – ${this.formatDate(endDate)}`;
        }
    }

    createMediaObjects() {
        const mediaContainer = document.getElementById('mediaContainer');
        mediaContainer.innerHTML = '';
        this.dataManager.getAllEntries().forEach(data => {
            mediaContainer.appendChild(this.createMediaObject(data));
        });
    }

    createMediaObject(data) {
        const mediaObject = document.createElement('div');
        mediaObject.className = 'media-object';

        const leftImage = this.createElement('img', { src: data.leftImage, alt: 'Winner', className: 'left-image' });
        const mediaContent = this.createMediaContent(data);
        const badgesContainer = this.createBadgesContainer(data.selectedBadges);

        mediaObject.appendChild(leftImage);
        mediaObject.appendChild(mediaContent);
        mediaObject.appendChild(badgesContainer);
        return mediaObject;
    }

    createMediaContent(data) {
        const div = this.createElement('div', { className: 'media-content' });
        div.appendChild(this.createElement('h3', { textContent: data.spotWinnerName }));
        div.appendChild(this.createElement('p', { textContent: data.description }));
        div.appendChild(this.createElement('p', { className: 'send-by', textContent: `– ${data.spotSenderName}` }));
        return div;
    }

    createBadgesContainer(selectedBadges) {
        const container = this.createElement('div', { className: 'badges-container' });
        if (selectedBadges && selectedBadges.length > 0) {
            selectedBadges.forEach(badge => {
                container.appendChild(this.createElement('img', {
                    src: badge.imagePath, alt: badge.label,
                    className: 'media-badge-image', title: badge.label
                }));
            });
        }
        return container;
    }

    createElement(tag, attributes = {}) {
        const el = document.createElement(tag);
        Object.keys(attributes).forEach(key => {
            if (key === 'textContent') el.textContent = attributes[key];
            else el[key] = attributes[key];
        });
        return el;
    }

    async processImageGeneration() {
        // Small delay to let the hidden DOM paint
        await new Promise(resolve => requestAnimationFrame(() => setTimeout(resolve, 100)));

        const canvas = await html2canvas(document.querySelector('#email_image'), {
            useCORS: true,
            allowTaint: true,
            scale: 1
        });

        this.setGenerateLoading(false);
        modalManager.showWallOfFamePreview(canvas);
    }

    downloadImage(canvas) {
        const link = document.createElement('a');
        const date = new Date().toISOString().split('T')[0];
        link.download = `spot_recognition_${date}.png`;
        link.href = canvas.toDataURL('image/png');
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }

    formatDate(dateString) {
        const options = { day: 'numeric', month: 'long', year: 'numeric' };
        return new Date(dateString).toLocaleDateString('en-GB', options);
    }
}

// Modal Management
class ModalManager {
    constructor() {
        this.downloadCanvas = null;
        this.createPhotoModal();
        this.setupPreviewModal();
    }

    // Photo preview (table image click)
    createPhotoModal() {
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

        modal.querySelector('.modal-close').addEventListener('click', () => this.hidePhotoModal());
        modal.addEventListener('click', e => { if (e.target === modal) this.hidePhotoModal(); });
        document.addEventListener('keydown', e => {
            if (e.key === 'Escape') { this.hidePhotoModal(); this.hideWallOfFamePreview(); }
        });
    }

    showModal(imageSrc, caption) {
        const modal = document.getElementById('imageModal');
        modal.querySelector('.modal-image').src = imageSrc;
        modal.querySelector('.modal-caption').textContent = caption;
        modal.style.display = 'block';
        document.body.style.overflow = 'hidden';
    }

    hideModal() { this.hidePhotoModal(); }

    hidePhotoModal() {
        const modal = document.getElementById('imageModal');
        modal.style.display = 'none';
        document.body.style.overflow = '';
    }

    // Wall of Fame preview
    setupPreviewModal() {
        const overlay = document.getElementById('preview-modal');
        if (overlay) {
            overlay.addEventListener('click', e => {
                if (e.target === overlay) this.hideWallOfFamePreview();
            });
        }
    }

    showWallOfFamePreview(canvas) {
        this.downloadCanvas = canvas;
        const overlay = document.getElementById('preview-modal');
        const img = document.getElementById('preview-img');
        img.src = canvas.toDataURL('image/png');
        overlay.classList.add('open');
        document.body.style.overflow = 'hidden';
    }

    hideWallOfFamePreview() {
        const overlay = document.getElementById('preview-modal');
        overlay.classList.remove('open');
        document.body.style.overflow = '';
        this.downloadCanvas = null;
    }
}

// Badge Multi-Select
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
        document.addEventListener('click', e => {
            if (!e.target.closest('.badge-multiselect')) this.closeDropdown();
        });
        this.dropdown.addEventListener('click', e => {
            e.stopPropagation();
            const option = e.target.closest('.badge-option');
            if (option) this.toggleBadge(option);
        });
    }

    toggleDropdown() {
        this.isOpen ? this.closeDropdown() : this.openDropdown();
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
        if (this.selectedBadges.find(b => b.value === value)) {
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
        this.selectedBadges = this.selectedBadges.filter(b => b.value !== value);
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
        const count = this.selectedBadges.length;
        if (count === 0) {
            this.placeholder.textContent = 'Choose badges...';
            this.placeholder.classList.remove('has-selection');
        } else {
            this.placeholder.textContent = `${count} badge${count > 1 ? 's' : ''} selected`;
            this.placeholder.classList.add('has-selection');
        }
    }

    updateSelectedBadges() {
        this.selectedContainer.innerHTML = '';
        this.selectedBadges.forEach((badge, index) => {
            const el = document.createElement('div');
            el.className = 'selected-badge';
            el.innerHTML = `
                <img src="./assets/images/${badge.image}" alt="${badge.label}" class="selected-badge-icon">
                <span>${badge.label}</span>
                <button type="button" class="selected-badge-remove" onclick="badgeMultiSelect.removeBadgeByIndex(${index})">×</button>
            `;
            this.selectedContainer.appendChild(el);
        });
    }

    getSelectedBadges() {
        return this.selectedBadges.map(badge => ({
            value: badge.value, image: badge.image, label: badge.label,
            imagePath: `./assets/images/${badge.image}`
        }));
    }

    setSelectedBadges(badges) {
        this.selectedBadges = [];
        this.dropdown.querySelectorAll('.badge-option').forEach(option => {
            option.classList.remove('selected');
            option.querySelector('.badge-checkbox').textContent = '☐';
        });
        badges.forEach(badge => this.addBadge(badge));
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

// Initialize
const notificationManager = new NotificationManager();
const dataManager = new SpotRecognitionData();
const badgeMultiSelect = new BadgeMultiSelectManager();
const formManager = new FormManager(dataManager, notificationManager);
const tableManager = new TableManager(dataManager, notificationManager);
const imageGenerator = new ImageGenerator(dataManager, notificationManager);
const modalManager = new ModalManager();

// Global functions for HTML event handlers
function submitForm() { formManager.submitForm(); }

function deleteRow(index) {
    dataManager.deleteEntry(index);
    tableManager.updateTable();
    notificationManager.success('Entry deleted');
}

function cloneRow(index) {
    dataManager.cloneEntry(index);
    tableManager.updateTable();
    notificationManager.success('Entry cloned');
}

function editRow(index) {
    const data = dataManager.getEntry(index);
    if (data) {
        dataManager.setEditMode(index);
        formManager.populateFormForEdit(data);
        tableManager.updateTable();
        document.querySelector('.form-panel').scrollIntoView({ behavior: 'smooth' });
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
    if (data && confirm(`Delete entry for "${data.spotWinnerName}"?`)) {
        deleteRow(index);
    }
}

function generateImage() { imageGenerator.generateImage(); }

function showImageModal(imageSrc, caption) { modalManager.showModal(imageSrc, caption); }

function toggleBadgeDropdown() { badgeMultiSelect.toggleDropdown(); }

function closePreviewModal() { modalManager.hideWallOfFamePreview(); }

function downloadPreviewImage() {
    if (modalManager.downloadCanvas) {
        imageGenerator.downloadImage(modalManager.downloadCanvas);
        notificationManager.success('Image saved successfully');
    }
}

document.addEventListener('DOMContentLoaded', () => {
    tableManager.updateTable();
});
