document.addEventListener('DOMContentLoaded', () => {
    const addContactForm = document.getElementById('add-contact-form');
    const pasteDataBtn = document.getElementById('paste-data-btn');
    const spreadsheetData = document.getElementById('spreadsheet-data');
    const contactList = document.getElementById('contact-list');
    const submitButton = addContactForm.querySelector('button[type="submit"]');

    const API_URL = 'http://localhost:3000/api/contacts';

    function renderContacts(contacts) {
        contactList.innerHTML = '';
        if (!contacts) return;
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

    async function fetchContacts() {
        try {
            const response = await fetch(API_URL);
            const contacts = await response.json();
            renderContacts(contacts);
        } catch (error) {
            console.error('Erro ao buscar contatos:', error);
        }
    }

    function resetForm() {
        addContactForm.reset();
        delete addContactForm.dataset.editingId;
        submitButton.textContent = 'Adicionar Contato';
    }

    addContactForm.addEventListener('submit', async (event) => {
        event.preventDefault();
        const name = document.getElementById('name').value;
        const phone = document.getElementById('phone').value;
        const status = document.getElementById('status').value;
        const editingId = addContactForm.dataset.editingId;

        const contactData = { name, phone, status };

        try {
            if (editingId) {
                await fetch(`${API_URL}/${editingId}`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(contactData)
                });
            } else {
                await fetch(API_URL, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(contactData)
                });
            }
            resetForm();
            fetchContacts();
        } catch (error) {
            console.error('Erro ao salvar contato:', error);
        }
    });

    pasteDataBtn.addEventListener('click', async () => {
        const data = spreadsheetData.value.trim();
        if (!data) return;

        const lines = data.split('\n');
        const contactPromises = lines.map(line => {
            const [name, phone, status] = line.split('	');
            if (name && phone && status) {
                return fetch(API_URL, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ name: name.trim(), phone: phone.trim(), status: status.trim() })
                });
            }
            return Promise.resolve();
        });

        try {
            await Promise.all(contactPromises);
            spreadsheetData.value = '';
            fetchContacts();
        } catch (error) {
            console.error('Erro ao colar contatos:', error);
        }
    });

    contactList.addEventListener('click', async (event) => {
        const target = event.target;
        const contactId = target.dataset.id;

        if (target.classList.contains('delete-btn')) {
            try {
                await fetch(`${API_URL}/${contactId}`, { method: 'DELETE' });
                fetchContacts();
            } catch (error) {
                console.error('Erro ao excluir contato:', error);
            }
        }

        if (target.classList.contains('edit-btn')) {
            try {
                const response = await fetch(`${API_URL}`);
                const contacts = await response.json();
                const contactToEdit = contacts.find(c => c.id == contactId);
                if (contactToEdit) {
                    document.getElementById('name').value = contactToEdit.name;
                    document.getElementById('phone').value = contactToEdit.phone;
                    document.getElementById('status').value = contactToEdit.status;
                    addContactForm.dataset.editingId = contactId;
                    submitButton.textContent = 'Atualizar Contato';
                }
            } catch (error) {
                console.error('Erro ao buscar dados para edição:', error);
            }
        }
    });

    // Initial fetch of contacts
    fetchContacts();
});
