document.addEventListener('DOMContentLoaded', () => {
    const modrinthProjectsContainer = document.getElementById('modrinth-projects');
    const githubActivityContainer = document.getElementById('github-activity-streak');
    const chessComLastOnlineContainer = document.getElementById('chess-com-last-online');
    const chessComDynamicLastSeenContainer = document.getElementById('chess-com-dynamic-last-seen');

    const username = 'ivoternis';

    async function fetchGithubActivity() {
        try {
            const response = await fetch(
                `https://api.github.com/users/${username}/events`,
            );

            if (!response.ok) {
                throw new Error(
                    `GitHub API HTTP error! status: ${response.status}`,
                );
            }

            const github_activity_log = await response.json();
            console.log('GitHub Activity Log:', github_activity_log);

            return github_activity_log;
        } catch (error) {
            console.error('Failed to fetch GitHub activity:', error);
            if (githubActivityContainer) {
                githubActivityContainer.innerHTML =
                    '<p>Fehler beim Laden der GitHub-Aktivität.</p>';
            }
        }
    }

    async function countGithubActivityStreak() {
        const activityLog = await fetchGithubActivity();
        if (!activityLog || activityLog.length === 0) {
            if (githubActivityContainer) {
                githubActivityContainer.innerHTML =
                    '<p>Keine GitHub-Aktivität gefunden.</p>';
            }
            return;
        }

        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const activityDates = new Set();
        activityLog.forEach((event) => {
            const eventDate = new Date(event.created_at);
            eventDate.setHours(0, 0, 0, 0);
            activityDates.add(eventDate.toISOString());
        });

        let streak = 0;
        let yesterdayHadActivity = false;
        let currentDay = new Date(today);

        const todayHasActivity = activityDates.has(today.toISOString());

        if (todayHasActivity) {
            streak = 1;
        }

        let loopLimit = 365;
        for (let i = 0; i < loopLimit; i++) {
            const dayToCheck = new Date(currentDay);
            dayToCheck.setDate(currentDay.getDate() - i);
            dayToCheck.setHours(0, 0, 0, 0);

            const dayString = dayToCheck.toISOString();

            if (i === 0) {
                if (!todayHasActivity) {
                    const yesterday = new Date(today);
                    yesterday.setDate(today.getDate() - 1);
                    yesterday.setHours(0, 0, 0, 0);
                    if (activityDates.has(yesterday.toISOString())) {
                        streak = 1;
                        yesterdayHadActivity = true;
                    } else {
                        yesterdayHadActivity = false;
                    }
                } else {
                    yesterdayHadActivity = true;
                }
                continue;
            }

            if (activityDates.has(dayString)) {
                if (yesterdayHadActivity) {
                    streak++;
                } else {
                    streak = 1;
                    yesterdayHadActivity = true;
                }
            } else {
                if (yesterdayHadActivity) {
                    break;
                }
            }
            yesterdayHadActivity = activityDates.has(dayString);
        }

        let streakSuffix = '';
        if (todayHasActivity && streak > 0) {
            streakSuffix = '+';
        } else if (streak === 0 && todayHasActivity) {
            streak = 1;
            streakSuffix = '+';
        }

        if (githubActivityContainer) {
            githubActivityContainer.innerHTML = `
                <p>GitHub Aktivitäts-Streak: <strong>${streak}${streakSuffix} Tage</strong></p>
            `;
        }
    }

    async function fetchChessComLastOnline() {
        if (!chessComLastOnlineContainer) {
            console.error('Kein Chess.com Container gefunden.');
            return;
        }

        try {
            const response = await fetch(
                `https://api.chess.com/pub/player/${username}`,
            );

            if (!response.ok) {
                throw new Error(
                    `Chess.com API HTTP error! status: ${response.status}`,
                );
            }

            const playerData = await response.json();
            console.log('Chess.com Player Data:', playerData);

            if (playerData && playerData.last_online) {
                const lastOnlineTimestamp = playerData.last_online * 1000;
                const lastOnlineDate = new Date(lastOnlineTimestamp);

                const options = {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                };
                const formattedDate = lastOnlineDate.toLocaleDateString(
                    'de-DE',
                    options,
                );

                chessComLastOnlineContainer.innerHTML = `
                    <p>Zuletzt Online auf Chess.com: <strong>${formattedDate}</strong></p>
                `;
            } else {
                chessComLastOnlineContainer.innerHTML =
                    '<p>Keine "zuletzt Online"-Daten von Chess.com verfügbar.</p>';
            }
        } catch (error) {
            console.error(
                'Failed to fetch Chess.com last online status:',
                error,
            );
            chessComLastOnlineContainer.innerHTML =
                '<p>Fehler beim Laden der Chess.com Aktivität.</p>';
        }
    }

    function formatRelativeTime(date) {
        const now = new Date();
        const seconds = Math.round((now.getTime() - date.getTime()) / 1000);
        const minutes = Math.round(seconds / 60);
        const hours = Math.round(minutes / 60);
        const days = Math.round(hours / 24);
        const months = Math.round(days / 30); // Approximation
        const years = Math.round(days / 365); // Approximation

        if (seconds < 45) {
            return 'gerade eben'; // "just now"
        } else if (seconds < 90) {
            return 'vor einer Minute'; // "a minute ago"
        } else if (minutes < 45) {
            return `vor ${minutes} Minuten`; // "X minutes ago"
        } else if (minutes < 90) {
            return 'vor einer Stunde'; // "an hour ago"
        } else if (hours < 22) {
            return `vor ${hours} Stunden`; // "X hours ago"
        } else if (hours < 36) {
            return 'gestern'; // "yesterday"
        } else if (days < 25) {
            return `vor ${days} Tagen`; // "X days ago"
        } else if (days < 45) {
            return 'vor einem Monat'; // "a month ago"
        } else if (months < 10) {
            return `vor ${months} Monaten`; // "X months ago"
        } else if (years < 2) {
            return 'vor einem Jahr'; // "a year ago"
        } else {
            return `vor ${years} Jahren`; // "X years ago"
        }
    }

    async function getDynamicChessComLastSeen() {
        if (!chessComDynamicLastSeenContainer) {
            console.error('Kein Dynamic Chess.com Container gefunden.');
            return;
        }

        try {
            const response = await fetch(
                `https://api.chess.com/pub/player/${username}`,
            );

            if (!response.ok) {
                throw new Error(
                    `Chess.com API HTTP error! status: ${response.status}`,
                );
            }

            const playerData = await response.json();

            if (playerData && playerData.last_online) {
                const lastOnlineTimestamp = playerData.last_online * 1000;
                const lastOnlineDate = new Date(lastOnlineTimestamp);
                const relativeTime = formatRelativeTime(lastOnlineDate);

                chessComDynamicLastSeenContainer.innerHTML = `
                    <p>Zuletzt Online auf Chess.com: <strong>${relativeTime}</strong></p>
                `;
            } else {
                chessComDynamicLastSeenContainer.innerHTML =
                    '<p>Keine "zuletzt Online"-Daten von Chess.com verfügbar.</p>';
            }
        } catch (error) {
            console.error(
                'Failed to fetch dynamic Chess.com last seen status:',
                error,
            );
            chessComDynamicLastSeenContainer.innerHTML =
                '<p>Fehler beim Laden der dynamischen Chess.com Aktivität.</p>';
        }
    }

    countGithubActivityStreak();
    fetchChessComLastOnline();
    getDynamicChessComLastSeen();

    if (!modrinthProjectsContainer) {
        console.error('Kein Modrinth Projektcontainder gefunden.');
        return;
    }

    function sanitizeHTML(str) {
        const div = document.createElement('div');
        div.appendChild(document.createTextNode(str));
        return div.innerHTML;
    }

    async function fetchModrinthProjects() {
        try {
            const response = await fetch(
                `https://api.modrinth.com/v2/user/${username}/projects`,
            );
            if (!response.ok) {
                throw new Error(
                    `HTTP error! status: ${response.status}`,
                );
            }
            const projects = await response.json();
            displayProjects(projects);
        } catch (error) {
            console.error(
                'Failed to fetch Modrinth projects:',
                error,
            );
            modrinthProjectsContainer.innerHTML =
                '<p>Fehler beim Laden der Modrinth-Projekte.</p>';
        }
    }

    function displayProjects(projects) {
        if (projects.length === 0) {
            modrinthProjectsContainer.innerHTML =
                '<p>Keine Modrinth-Projekte gefunden.</p>';
            return;
        }

        projects.forEach((project) => {
            const projectCard = document.createElement('div');
            projectCard.classList.add('project-card');

            const safeTitle = sanitizeHTML(project.title);
            const safeDescription = sanitizeHTML(
                project.description.length > 150
                    ? project.description.substring(0, 150) + '...'
                    : project.description,
            );
            const projectUrl = `https://modrinth.com/mod/${project.slug}`;

            let categoriesHtml = '';
            if (project.categories && project.categories.length > 0) {
                categoriesHtml =
                    '<div class="project-card-categories">';
                project.categories.slice(0, 3).forEach((category) => {
                    categoriesHtml += `<span class="project-card-category">${sanitizeHTML(
                        category,
                    )}</span>`;
                });
                categoriesHtml += '</div>';
            }

            projectCard.innerHTML = `
                <div class="project-card-header">
                    <img src="${sanitizeHTML(
                        project.icon_url,
                    )}" alt="${safeTitle} Icon" class="project-card-icon">
                    <div class="project-card-text-content">
                        <h3 class="project-card-title">${safeTitle}</h3>
                        <p class="project-card-description">${safeDescription}</p>
                    </div>
                </div>
                ${categoriesHtml}
                <div class="project-card-footer">
                    <span class="project-card-downloads">Downloads: ${project.downloads.toLocaleString()}</span>
                    <a href="${sanitizeHTML(
                        projectUrl,
                    )}" target="_blank" class="project-card-link">Ansehen</a>
                </div>
            `;
            modrinthProjectsContainer.appendChild(projectCard);
        });
    }

    fetchModrinthProjects();
});