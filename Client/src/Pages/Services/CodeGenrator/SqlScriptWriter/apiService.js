const API_BASE_URL = `${VITE_BACKEND_URL}/api/codewriter`;

export const makeApiCall = async(endpoint, data, setLoading, setError, setResponse) => {
    setLoading(true);
    setError(null);
    setResponse(null);

    try {
        const response = await fetch(`${API_BASE_URL}${endpoint}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data)
        });

        const result = await response.json();

        if (!response.ok) {
            throw new Error(result.error || 'API request failed');
        }

        setResponse(result);
    } catch (err) {
        setError(err.message);
    } finally {
        setLoading(false);
    }
};