// Mobile menu toggle handler
document.getElementById('menu-btn').addEventListener('click', function () {
    const menu = document.getElementById('menu');
    menu.classList.toggle('hidden');
});

// Main initialization when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    // Initialize intersection observer for fade-in animations
    // This creates smooth appearance animations when elements come into view
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
            }
        });
    }, { threshold: 0.1 });

    // Apply fade-in animation to main sections
    document.querySelectorAll('.bg-gray-800, #projects, #about, #skills')
        .forEach(el => {
            el.classList.add('fade-in');
            observer.observe(el);
        });

    // Function to fetch and display GitHub repositories
    async function fetchGitHubRepos() {
        const projectsGrid = document.getElementById('projects-grid');
        const featuredProject = document.getElementById('featured-project');
        projectsGrid.innerHTML = '<div class="loading mx-auto"></div>';
        featuredProject.innerHTML = '<div class="loading mx-auto"></div>';

        try {
            const username = 'H1tRecord';
            const response = await fetch(`https://api.github.com/users/${username}/repos?sort=updated&direction=desc`);
            
            if (!response.ok) throw new Error('Failed to fetch repositories');

            const repos = await response.json();
            const filteredRepos = repos.filter(repo => !repo.fork);
            // Filter repos for featured section - must have stars or forks
            const featuredRepos = filteredRepos.filter(repo => repo.stargazers_count > 0 || repo.forks_count > 0);

            if (filteredRepos.length === 0) {
                projectsGrid.innerHTML = '<p class="text-white">No repositories found.</p>';
                return;
            }

            // Featured project card with rotation
            let currentFeaturedIndex = 0;
            const featuredHTML = `
                <div class="h-[200px]"> <!-- Fixed outer container height -->
                    <div class="bg-gray-800/50 backdrop-blur-sm border border-gray-700 p-8 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 h-full relative overflow-hidden">
                        <div id="featured-content" class="h-full"></div>
                    </div>
                </div>
            `;
            featuredProject.innerHTML = featuredHTML;

            function updateFeaturedProject() {
                if (featuredRepos.length === 0) {
                    // If no featured repos, show message
                    document.getElementById('featured-content').innerHTML = `
                        <div class="flex flex-col h-full justify-center items-center">
                            <p class="text-gray-400 text-center">No featured repositories yet.</p>
                        </div>
                    `;
                    return;
                }

                const contentEl = document.getElementById('featured-content');
                contentEl.classList.add('slide-out');
                
                setTimeout(() => {
                    const repo = featuredRepos[currentFeaturedIndex];
                    contentEl.innerHTML = `
                        <div class="flex flex-col h-full">
                            <div class="flex justify-between items-start min-h-0 flex-1">
                                <div class="flex-1 overflow-hidden pr-4">
                                    <h3 class="text-xl text-white font-bold hover:text-purple-400 truncate">
                                        <a href="${repo.html_url}" target="_blank">${repo.name}</a>
                                    </h3>
                                    <p class="text-gray-400 mt-2 text-base line-clamp-2">${repo.description || 'No description available'}</p>
                                </div>
                                <a href="${repo.html_url}" target="_blank" class="text-gray-400 hover:text-purple-400 transform transition-transform hover:scale-110 flex-shrink-0">
                                    <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                                    </svg>
                                </a>
                            </div>
                            <div class="flex items-center justify-between text-sm pt-4 border-t border-gray-700/50 mt-auto">
                                <div class="flex space-x-4">
                                    <span class="flex items-center text-gray-400">
                                        <span class="w-2 h-2 rounded-full ${repo.language ? 'bg-purple-400' : 'bg-gray-400'} mr-2"></span>
                                        ${repo.language || 'Unknown'}
                                    </span>
                                    <span class="flex items-center text-gray-400">
                                        <svg class="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 24 24">
                                            <path d="M12 .25a.75.75 0 01.673.418l3.058 6.197 6.839.994a.75.75 0 01.415 1.279l-4.948 4.823 1.168 6.811a.75.75 0 01-1.088.791L12 18.347l-6.117 3.216a.75.75 0 01-1.088-.79l1.168-6.812-4.948-4.823a.75.75 0 01.416-1.28l6.838-.993L11.327.668A.75.75 0 0112 .25z"/>
                                        </svg>
                                        ${repo.stargazers_count}
                                    </span>
                                    <span class="flex items-center text-gray-400">
                                        <svg class="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 24 24">
                                            <path d="M12 21a1.75 1.75 0 110-3.5 1.75 1.75 0 010 3.5zm-3.25-1.75a3.25 3.25 0 106.5 0 3.25 3.25 0 00-6.5 0z"/>
                                        </svg>
                                        ${repo.forks_count}
                                    </span>
                                </div>
                                <span class="text-gray-400 text-xs">Updated ${new Date(repo.updated_at).toLocaleDateString()}</span>
                            </div>
                        </div>
                    `;
                    contentEl.classList.remove('slide-out');
                    contentEl.classList.add('slide-in');
                    
                    setTimeout(() => {
                        contentEl.classList.remove('slide-in');
                    }, 300);

                    currentFeaturedIndex = (currentFeaturedIndex + 1) % featuredRepos.length;
                }, 300);
            }

            updateFeaturedProject();
            // Only start interval if there are featured repos
            if (featuredRepos.length > 0) {
                setInterval(updateFeaturedProject, 5000);
            }

            // Regular project cards
            const REPOS_PER_PAGE = 6; // 3 rows x 2 columns
            let currentPage = 0;
            const totalPages = Math.ceil(filteredRepos.length / REPOS_PER_PAGE);

            function renderRepoPage(page) {
                const startIndex = page * REPOS_PER_PAGE;
                const pageRepos = filteredRepos.slice(startIndex, startIndex + REPOS_PER_PAGE);
                
                // Fill empty slots with placeholder cards to maintain grid structure
                const emptySlots = REPOS_PER_PAGE - pageRepos.length;
                const filledRepos = [
                    ...pageRepos,
                    ...Array(emptySlots).fill({ isPlaceholder: true })
                ];
                
                const reposHTML = filledRepos.map(repo => {
                    if (repo.isPlaceholder) {
                        return `
                            <div class="bg-gray-800/20 border border-gray-700/20 p-6 rounded-xl h-[140px] opacity-0 pointer-events-none">
                                <!-- Empty placeholder to maintain grid structure -->
                            </div>
                        `;
                    }
                    return `
                        <div class="transform transition-all duration-300 hover:-translate-y-1 bg-gray-800/50 backdrop-blur-sm border border-gray-700 p-6 rounded-xl shadow-lg hover:shadow-xl h-[140px] relative overflow-hidden">
                            <div class="flex flex-col h-full">
                                <div class="flex-1 overflow-hidden">
                                    <h3 class="text-sm font-bold text-white hover:text-purple-400 truncate mb-2">
                                        <a href="${repo.html_url}" target="_blank">${repo.name}</a>
                                    </h3>
                                    <p class="text-gray-400 text-xs line-clamp-2 h-[32px]">${repo.description || 'No description available'}</p>
                                </div>
                                <div class="flex items-center justify-between text-xs pt-2 mt-auto border-t border-gray-700/50">
                                    <span class="flex items-center text-gray-400">
                                        <span class="w-2 h-2 rounded-full ${repo.language ? 'bg-purple-400' : 'bg-gray-400'} mr-1"></span>
                                        ${repo.language || 'Unknown'}
                                    </span>
                                    <span class="flex items-center text-gray-400">
                                        <svg class="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 24 24">
                                            <path d="M12 .25a.75.75 0 01.673.418l3.058 6.197 6.839.994a.75.75 0 01.415 1.279l-4.948 4.823 1.168 6.811a.75.75 0 01-1.088.791L12 18.347l-6.117 3.216a.75.75 0 01-1.088-.79l1.168-6.812-4.948-4.823a.75.75 0 01.416-1.28l6.838-.993L11.327.668A.75.75 0 0112 .25z"/>
                                        </svg>
                                        ${repo.stargazers_count}
                                    </span>
                                </div>
                            </div>
                        </div>
                    `;
                }).join('');

                const paginationHTML = totalPages > 1 ? `
                    <div class="flex justify-center items-center mt-8 mb-2">
                        <div class="flex items-center gap-3 px-4 py-2 bg-gray-800/50 backdrop-blur-sm rounded-full border border-gray-700/50">
                            <button 
                                class="text-gray-400 hover:text-purple-400 transition-colors duration-300 ${currentPage === 0 ? 'opacity-50 cursor-not-allowed' : ''}"
                                onclick="changePage(${currentPage - 1})"
                                ${currentPage === 0 ? 'disabled' : ''}
                                aria-label="Previous page"
                            >
                                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
                                </svg>
                            </button>
                            <div class="flex items-center gap-2">
                                ${Array.from({ length: totalPages }, (_, i) => `
                                    <button 
                                        class="w-2 h-2 rounded-full transition-all duration-300 ${i === currentPage ? 'bg-purple-400 w-6' : 'bg-gray-600 hover:bg-gray-500'}" 
                                        onclick="changePage(${i})"
                                        aria-label="Go to page ${i + 1}"
                                        aria-current="${i === currentPage ? 'page' : 'false'}"
                                    ></button>
                                `).join('')}
                            </div>
                            <button 
                                class="text-gray-400 hover:text-purple-400 transition-colors duration-300 ${currentPage === totalPages - 1 ? 'opacity-50 cursor-not-allowed' : ''}"
                                onclick="changePage(${currentPage + 1})"
                                ${currentPage === totalPages - 1 ? 'disabled' : ''}
                                aria-label="Next page"
                            >
                                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
                                </svg>
                            </button>
                        </div>
                    </div>
                ` : '';

                projectsGrid.style.opacity = '0';
                projectsGrid.style.transform = 'translateY(10px)';
                
                setTimeout(() => {
                    projectsGrid.innerHTML = reposHTML;
                    projectsGrid.classList.add('page-transition');
                    
                    // Update pagination separately
                    const paginationContainer = document.getElementById('pagination-container');
                    if (paginationContainer) {
                        paginationContainer.innerHTML = paginationHTML;
                    }
                    
                    setTimeout(() => {
                        projectsGrid.classList.remove('page-transition');
                        projectsGrid.style.opacity = '';
                        projectsGrid.style.transform = '';
                    }, 400);
                }, 50);
            }

            // Initialize first page
            renderRepoPage(0);

            // Add global function to change pages
            window.changePage = function(page) {
                currentPage = page;
                renderRepoPage(page);
            };
        } catch (error) {
            console.error('Error fetching repositories:', error);
            projectsGrid.innerHTML = '<p class="text-white">Failed to load repositories. Please try again later.</p>';
            featuredProject.innerHTML = '';
        }
    }

    // Fetch GitHub repositories on page load
    fetchGitHubRepos();

    // Function to fetch and populate content from content.json
    async function fetchContent() {
        try {
            // Fetch content data
            const response = await fetch('content.json');
            if (!response.ok) throw new Error('Failed to fetch content');
            const content = await response.json();

            // Populate About section with personal info
            document.getElementById('about-name').innerHTML = `Hi! I'm <span class="text-purple-400">${content.about.name}</span>, an aspiring developer from the <span class="flag-colors">${content.about.location}</span>`;
            document.getElementById('about-description').innerText = content.about.description;

            // Update social links with dynamic content
            const socialLinks = document.getElementById('social-links');
            socialLinks.innerHTML = `
                <a href="${content.about.socials.twitter}" target="_blank" class="flex items-center text-gray-400 hover:text-white mb-2">
                    <i class="fab fa-twitter mr-2"></i>@HitRedcord
                </a>
                <a href="${content.about.socials.discord}" target="_blank" class="flex items-center text-gray-400 hover:text-white mb-2">
                    <i class="fab fa-discord mr-2"></i>HitRecord
                </a>
                <a href="${content.about.socials.email}" target="_blank" class="flex items-center text-gray-400 hover:text-white mb-2">
                    <i class="fas fa-envelope mr-2"></i>kjainfotech@gmail.com
                </a>
                <a href="${content.about.socials.github}" target="_blank" class="flex items-center text-gray-400 hover:text-white mb-2">
                    <i class="fab fa-github mr-2"></i>@H1tRecord
                </a>
            `;

            // Handle both old and new skills format
            const skillsContainer = document.getElementById('skills-container');
            
            if (Array.isArray(content.skills)) {
                // Handle legacy skills format
                skillsContainer.innerHTML = `
                    <div class="skill-category">
                        <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-6">
                            ${content.skills.map(skill => `
                                <div class="bg-gray-800 rounded-lg p-4 flex flex-col items-center text-center transform hover:scale-105 transition-transform">
                                    <img src="${skill.icon}" alt="${skill.name}" class="mb-2 w-12 h-12">
                                    <h2 class="text-lg font-bold">${skill.name}</h2>
                                    <div class="text-purple-400 mt-2">${skill.level}</div>
                                </div>
                            `).join('')}
                        </div>
                    </div>
                `;
            } else if (content.skills.categories) {
                // Handle new categorized skills format
                skillsContainer.innerHTML = content.skills.categories.map(category => `
                    <div class="skill-category mb-8">
                        <h3 class="text-xl font-semibold mb-4 text-purple-400">${category.name}</h3>
                        <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-6">
                            ${category.items.map(skill => `
                                <div class="bg-gray-800 rounded-lg p-4 flex flex-col items-center text-center transform hover:scale-105 transition-transform">
                                    <img src="${skill.icon}" alt="${skill.name}" class="mb-2 w-12 h-12">
                                    <h2 class="text-lg font-bold">${skill.name}</h2>
                                    <div class="text-purple-400 mt-2">${skill.level}</div>
                                </div>
                            `).join('')}
                        </div>
                    </div>
                `).join('');
            }

            // Update footer with dynamic content
            if (content.footer) {
                // Populate social icons, copyright, and links
                document.getElementById('footer-socials').innerHTML = content.footer.socials
                    .map(social => `
                        <a href="${social.url}" target="_blank" class="text-white mx-2 transition-colors duration-300 hover:text-purple-400">
                            <i class="${social.icon}"></i>
                        </a>
                    `).join('');

                document.getElementById('footer-copyright').innerHTML = `&copy; ${content.footer.copyright}`;
                document.getElementById('footer-links').innerHTML = content.footer.links
                    .map(link => `
                        <p class="text-white">Check out the <a href="${link.url}" target="_blank" class="text-white transition-colors duration-300 hover:text-purple-400">${link.text}</a>!</p>
                    `).join('');
            }
        } catch (error) {
            // Handle content loading errors
            console.error('Error fetching content:', error);
            document.getElementById('skills-container').innerHTML = '<p class="text-white">Failed to load skills. Please try again later.</p>';
        }
    }

    // Fetch content on page load
    fetchContent();
});

// Function to update time display
function updateTime() {
    // Format time with Philippines timezone
    const options = { timeZone: 'Asia/Manila', hour12: true, hour: 'numeric', minute: 'numeric', second: 'numeric', day: 'numeric', month: 'long', year: 'numeric' };
    const now = new Date().toLocaleString('en-US', options);
    document.getElementById('time-date').innerText = now;
}

// Initialize and update time display every second
updateTime();
setInterval(updateTime, 1000);

// Smooth scroll handler for navigation links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const targetId = this.getAttribute('href').substring(1);
        const targetElement = document.getElementById(targetId);
        const offsetPosition = targetElement.offsetTop - document.querySelector('nav').offsetHeight;
        window.scrollTo({
            top: offsetPosition,
            behavior: 'smooth'
        });
    });
});

// Function to handle section scrolling and mobile menu
function scrollToSection(id) {
    // Scroll to target section with offset for navigation bar
    const element = document.getElementById(id);
    element.scrollIntoView({
        behavior: 'smooth',
        block: 'start'
    });
    
    // Close mobile menu if open
    const menu = document.getElementById('menu');
    if (!menu.classList.contains('hidden')) {
        menu.classList.add('hidden');
    }
}
