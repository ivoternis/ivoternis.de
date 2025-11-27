document.addEventListener('DOMContentLoaded', () => {
    const modrinthProjectsContainer =
        document.getElementById('modrinth-projects');
    const username = 'ivoternis';

    if (!modrinthProjectsContainer) {
        console.error('Modrinth projects container not found.');
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