import React, { useEffect, useState } from 'react';
import api from '../../api/axios';
import Table from '../../components/Table';

import Loader from '../../components/Loader';
const ContactList = () => {
    const [contacts, setContacts] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchContacts = async () => {
        try {
            const res = await api.get('/admin/contacts');
            setContacts(res.data.data);
        } catch (error) {
            console.error('Failed to fetch contacts data', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchContacts();
    }, []);

    const columns = [
        { header: 'ID', accessor: 'id' },
        { header: 'Name', accessor: 'name' },
        { header: 'Email', accessor: 'email' },
        { header: 'Phone', accessor: 'phone' },
        { header: 'Subject', accessor: 'subject' },
        { 
            header: 'Date', 
            accessor: 'createdAt',
            render: (row) => new Date(row.createdAt).toLocaleDateString()
        }
    ];

    if (loading) return <Loader size="large" />;

    return (
        <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
                <h1 style={{ fontSize: '24px', fontWeight: 'bold' }}>Contact Submissions</h1>
            </div>
            <Table 
                columns={columns} 
                data={contacts} 
            />
        </div>
    );
};

export default ContactList;
