document.addEventListener('DOMContentLoaded', () => {
    let timerInterval;
    let endTime;
    const apiKey = '312d2a72-a74d-4c05-911b-10a68db11703';

    const timerDisplay = document.getElementById('timer');
    const startButton = document.getElementById('start-button');
    const endButton = document.getElementById('end-button');
    const slackIdInput = document.getElementById('slack-id');
    const connectSlackButton = document.getElementById('connect-slack');
    const darkModeButton = document.getElementById('dark-mode');
    const lightModeButton = document.getElementById('light-mode');
    const sessionHistory = document.getElementById('session-history');
    const tabLinks = document.querySelectorAll('.tab-link');
    const tabContents = document.querySelectorAll('.tab-content');

    const updateTimerDisplay = () => {
        const now = new Date().getTime();
        const distance = endTime - now;
        const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((distance % (1000 * 60)) / 1000);
        timerDisplay.textContent = `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
        if (distance < 0) {
            clearInterval(timerInterval);
            timerDisplay.textContent = "00:00";
        }
    };

    startButton.addEventListener('click', async () => {
        const slackId = slackIdInput.value;
        const work = document.getElementById('coding-field').value;
        if (!slackId || !work) {
            alert('Please enter your Slack ID and what you are coding.');
            return;
        }
        try {
            const response = await fetch('/api/start', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${apiKey}`
                },
                body: JSON.stringify({ work })
            });
            const data = await response.json();
            if (data.ok) {
                const sessionResponse = await fetch(`/api/session/${slackId}`);
                const sessionData = await sessionResponse.json();
                if (sessionData.ok) {
                    endTime = new Date(sessionData.data.endTime).getTime();
                    timerInterval = setInterval(updateTimerDisplay, 1000);
                } else {
                    alert('Failed to retrieve session data.');
                }
            } else {
                alert('Failed to start session.');
            }
        } catch (error) {
            alert('Error starting session: ' + error.message);
        }
    });

    endButton.addEventListener('click', async () => {
        const slackId = slackIdInput.value;
        if (!slackId) {
            alert('Please enter your Slack ID.');
            return;
        }
        try {
            const response = await fetch('/api/cancel', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${apiKey}`
                }
            });
            const data = await response.json();
            if (data.ok) {
                clearInterval(timerInterval);
                timerDisplay.textContent = "60:00";
            } else {
                alert('Failed to end session.');
            }
        } catch (error) {
            alert('Error ending session: ' + error.message);
        }
    });

    connectSlackButton.addEventListener('click', () => {
        const slackId = slackIdInput.value;
        if (slackId) {
            alert('Successfully connected to Slack account.');
        } else {
            alert('Please enter your Slack ID.');
        }
    });

    darkModeButton.addEventListener('click', () => {
        document.body.classList.add('bg-gray-900', 'text-white');
        document.body.classList.remove('bg-white', 'text-gray-800');
    });

    lightModeButton.addEventListener('click', () => {
        document.body.classList.add('bg-white', 'text-gray-800');
        document.body.classList.remove('bg-gray-900', 'text-white');
    });

    const loadSessionHistory = async () => {
        const slackId = slackIdInput.value;
        if (!slackId) {
            return;
        }
        try {
            const response = await fetch(`/api/history/${slackId}`);
            const data = await response.json();
            if (data.ok) {
                sessionHistory.innerHTML = data.data.map(session => `
                    <li>${session.createdAt}: ${session.work} - ${session.time} minutes</li>
                `).join('');
            }
        } catch (error) {
            alert('Error loading session history: ' + error.message);
        }
    };

    loadSessionHistory();

    tabLinks.forEach(link => {
        link.addEventListener('click', () => {
            const target = link.getAttribute('data-target');
            tabContents.forEach(content => {
                content.classList.add('hidden');
                if (content.id === target) {
                    content.classList.remove('hidden');
                }
            });
        });
    });
});

