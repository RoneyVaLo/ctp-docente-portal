import { useEffect, useState } from 'react';

function App() {

    const [staff, setStaff] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        async function fetchStaff() {
            try {
                const response = await fetch('/api/staff');

                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }

                const data = await response.json();
                setStaff(data);
                setError(null);
            } catch (err) {
                setError(err.message);
                console.error('Error fetching staff:', err);
            } finally {
                setLoading(false);
            }
        }

        fetchStaff();
    }, []);

    if (loading) {
        return <div>Loading staff data...</div>;
    }

    if (error) {
        return <div style={{ color: 'red' }}>Error: {error}</div>;
    }

    return (
        <div style={{ padding: '20px' }}>
            <h2>Staff List (Test Connection)</h2>
            {staff.length === 0 ? (
                <p>No staff members found</p>
            ) : (
                <ul>
                    {staff.map(member => (
                        <li key={member.id}>
                            ID: {member.id}, Name: {member.name}
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
}

export default App;