document.addEventListener('DOMContentLoaded', () => {
    const addContactForm = document.getElementById('add-contact-form');
    const pasteDataBtn = document.getElementById('paste-data-btn');
    const spreadsheetData = document.getElementById('spreadsheet-data');
    const contactList = document.getElementById('contact-list');
    const submitButton = addContactForm.querySelector('button[type="submit"]');

    let contacts = [];

    function renderContacts() {
        contactList.innerHTML = '';
        contacts.forEach(contact => {
            const contactDiv = document.createElement('div');
            contactDiv.className = 'lancamento text-center row align-items-center';
            contactDiv.dataset.id = contact.id;
            contactDiv.innerHTML = `
                <div class="col-3">${contact.name}</div>
                <div class="col-3">${contact.phone}</div>
                <div class="col-3">${contact.status}</div>
                <div class="col-3">
                    <button class="btn btn-sm btn-warning edit-btn" data-id="${contact.id}">Editar</button>
                    <button class="btn btn-sm btn-danger delete-btn" data-id="${contact.id}">Excluir</button>
                </div>
            `;
            contactList.appendChild(contactDiv);
        });
    }

    function resetForm() {
        addContactForm.reset();
        delete addContactForm.dataset.editingId;
        submitButton.textContent = 'Adicionar Contato';
    }

    addContactForm.addEventListener('submit', (event) => {
        event.preventDefault();
        const nameInput = document.getElementById('name');
        const phoneInput = document.getElementById('phone');
        const statusInput = document.getElementById('status');
        const editingId = addContactForm.dataset.editingId;

        if (editingId) {
            const contactToUpdate = contacts.find(c => c.id === Number(editingId));
            if (contactToUpdate) {
                contactToUpdate.name = nameInput.value;
                contactToUpdate.phone = phoneInput.value;
                contactToUpdate.status = statusInput.value;
            }
        } else {
            const newContact = {
                id: Date.now(),
                name: nameInput.value,
                phone: phoneInput.value,
                status: statusInput.value
            };
            contacts.push(newContact);
        }

        renderContacts();
        resetForm();
    });

    pasteDataBtn.addEventListener('click', () => {
        const data = spreadsheetData.value.trim();
        if (!data) return;
        const lines = data.split('\n');
        const newContacts = lines.map(line => {
            const [name, phone, status] = line.split('	');
            if (name && phone && status) {
                return {
                    id: Date.now() + Math.random(),
                    name: name.trim(),
                    phone: phone.trim(),
                    status: status.trim()
                };
            }
            return null;
        }).filter(Boolean);

        contacts = contacts.concat(newContacts);
        renderContacts();
        spreadsheetData.value = '';
    });

    contactList.addEventListener('click', (event) => {
        const target = event.target;
        const contactId = Number(target.dataset.id);

        if (target.classList.contains('delete-btn')) {
            contacts = contacts.filter(c => c.id !== contactId);
            renderContacts();
        }

        if (target.classList.contains('edit-btn')) {
            const contactToEdit = contacts.find(c => c.id === contactId);
            if (contactToEdit) {
                document.getElementById('name').value = contactToEdit.name;
                document.getElementById('phone').value = contactToEdit.phone;
                document.getElementById('status').value = contactToEdit.status;
                addContactForm.dataset.editingId = contactId;
                submitButton.textContent = 'Atualizar Contato';
            }
        }
    });
});
