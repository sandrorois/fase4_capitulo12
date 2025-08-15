const express = require('express');
const cors = require('cors');
const fs = require('fs');

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());

const DB_FILE = './db.json';

// Helper function to read from the database file
const readDatabase = () => {
    const data = fs.readFileSync(DB_FILE);
    return JSON.parse(data);
};

// Helper function to write to the database file
const writeDatabase = (data) => {
    fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2));
};

// GET all contacts
app.get('/api/contacts', (req, res) => {
    try {
        const db = readDatabase();
        res.json(db.contacts);
    } catch (error) {
        res.status(500).json({ message: "Error reading database" });
    }
});

// POST a new contact
app.post('/api/contacts', (req, res) => {
    try {
        const db = readDatabase();
        const newContact = {
            id: Date.now(),
            ...req.body
        };
        db.contacts.push(newContact);
        writeDatabase(db);
        res.status(201).json(newContact);
    } catch (error) {
        res.status(500).json({ message: "Error writing to database" });
    }
});

// PUT (update) a contact
app.put('/api/contacts/:id', (req, res) => {
    try {
        const db = readDatabase();
        const contactId = Number(req.params.id);
        const updatedContactData = req.body;

        const contactIndex = db.contacts.findIndex(c => c.id === contactId);

        if (contactIndex === -1) {
            return res.status(404).json({ message: 'Contact not found' });
        }

        // Ensure the id is not changed by the request body
        const updatedContact = { ...db.contacts[contactIndex], ...updatedContactData, id: contactId };
        db.contacts[contactIndex] = updatedContact;
        writeDatabase(db);

        res.json(updatedContact);
    } catch (error) {
        res.status(500).json({ message: "Error updating database" });
    }
});

// DELETE a contact
app.delete('/api/contacts/:id', (req, res) => {
    try {
        const db = readDatabase();
        const contactId = Number(req.params.id);

        const initialLength = db.contacts.length;
        db.contacts = db.contacts.filter(c => c.id !== contactId);

        if (db.contacts.length === initialLength) {
            return res.status(404).json({ message: 'Contact not found' });
        }

        writeDatabase(db);
        res.status(204).send(); // No Content
    } catch (error) {
        res.status(500).json({ message: "Error deleting from database" });
    }
});


app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
