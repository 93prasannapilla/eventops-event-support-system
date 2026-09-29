"use strict";

const API_BASE_URL =
    window.location.protocol === "file:" ||
    window.location.hostname === "localhost" ||
    window.location.hostname === "127.0.0.1"
        ? "http://localhost:8080/api"
        : "/api";

const state = {
    currentUser: null,
    events: [],
    requests: []
};

const pageDetails = {
    dashboardSection: {
        eyebrow: "CONTROL CENTER",
        title: "Operations dashboard"
    },
    eventsSection: {
        eyebrow: "EVENT MANAGEMENT",
        title: "College events"
    },
    requestsSection: {
        eyebrow: "SUPPORT OPERATIONS",
        title: "Support requests"
    },
    createRequestSection: {
        eyebrow: "SMART REQUEST INTAKE",
        title: "Create request"
    }
};

document.addEventListener("DOMContentLoaded", initializeApplication);

function initializeApplication() {
    initializeTheme();
    initializeAuthenticationTabs();
    initializePasswordToggles();
    initializeAuthenticationForms();
    initializeNavigation();
    initializeSidebar();
    initializeEventForm();
    initializeRequestForm();
    initializeFilters();
    initializeLogout();

    restoreSession();
}

/* =========================
   THEME
========================= */

function initializeTheme() {
    const savedTheme = localStorage.getItem("eventops-theme");
    const prefersDark = window.matchMedia(
        "(prefers-color-scheme: dark)"
    ).matches;

    const shouldUseDark =
        savedTheme === "dark" ||
        (!savedTheme && prefersDark);

    document.body.classList.toggle("dark-theme", shouldUseDark);
    updateThemeIcons();

    document
        .querySelectorAll("#themeButton, #authThemeButton")
        .forEach((button) => {
            button.addEventListener("click", toggleTheme);
        });
}

function toggleTheme() {
    document.body.classList.toggle("dark-theme");

    const theme = document.body.classList.contains("dark-theme")
        ? "dark"
        : "light";

    localStorage.setItem("eventops-theme", theme);
    updateThemeIcons();
}

function updateThemeIcons() {
    const isDark = document.body.classList.contains("dark-theme");

    document.querySelectorAll(".theme-icon").forEach((icon) => {
        icon.textContent = isDark ? "☀" : "☾";
    });
}

/* =========================
   AUTHENTICATION UI
========================= */

function initializeAuthenticationTabs() {
    const loginTab = document.getElementById("loginTab");
    const registerTab = document.getElementById("registerTab");
    const openRegisterButton =
        document.getElementById("openRegisterButton");
    const openLoginButton =
        document.getElementById("openLoginButton");

    loginTab.addEventListener("click", showLoginForm);
    registerTab.addEventListener("click", showRegisterForm);
    openRegisterButton.addEventListener("click", showRegisterForm);
    openLoginButton.addEventListener("click", showLoginForm);
}

function showLoginForm() {
    document.getElementById("loginForm").classList.remove("hidden");
    document.getElementById("registerForm").classList.add("hidden");

    document.getElementById("loginTab").classList.add("active");
    document.getElementById("registerTab").classList.remove("active");
}

function showRegisterForm() {
    document.getElementById("registerForm").classList.remove("hidden");
    document.getElementById("loginForm").classList.add("hidden");

    document.getElementById("registerTab").classList.add("active");
    document.getElementById("loginTab").classList.remove("active");
}

function initializePasswordToggles() {
    document.querySelectorAll(".password-toggle").forEach((button) => {
        button.addEventListener("click", () => {
            const input = document.getElementById(button.dataset.target);
            const isPassword = input.type === "password";

            input.type = isPassword ? "text" : "password";
            button.textContent = isPassword ? "Hide" : "Show";
        });
    });
}

function initializeAuthenticationForms() {
    document
        .getElementById("loginForm")
        .addEventListener("submit", handleLogin);

    document
        .getElementById("registerForm")
        .addEventListener("submit", handleRegistration);
}

async function handleLogin(event) {
    event.preventDefault();

    const button = document.getElementById("loginButton");

    const loginData = {
        email: document.getElementById("loginEmail").value.trim(),
        password: document.getElementById("loginPassword").value
    };

    setButtonLoading(button, true, "Signing in...");

    try {
        const user = await apiRequest("/auth/login", {
            method: "POST",
            body: JSON.stringify(loginData)
        });

        saveSession(user);
        showToast("success", "Welcome back", user.message);
        showApplication();
    } catch (error) {
        showToast("error", "Sign-in failed", error.message);
    } finally {
        setButtonLoading(button, false, "Sign in");
    }
}

async function handleRegistration(event) {
    event.preventDefault();

    const button = document.getElementById("registerButton");

    const registrationData = {
        fullName: document.getElementById("registerName").value.trim(),
        email: document.getElementById("registerEmail").value.trim(),
        password: document.getElementById("registerPassword").value,
        role: document.getElementById("registerRole").value,
        department:
            document.getElementById("registerDepartment").value.trim() ||
            null
    };

    setButtonLoading(button, true, "Creating account...");

    try {
        const user = await apiRequest("/auth/register", {
            method: "POST",
            body: JSON.stringify(registrationData)
        });

        saveSession(user);
        showToast("success", "Account created", user.message);
        showApplication();
    } catch (error) {
        showToast("error", "Registration failed", error.message);
    } finally {
        setButtonLoading(button, false, "Create account");
    }
}

function saveSession(user) {
    state.currentUser = user;

    localStorage.setItem(
        "eventops-user",
        JSON.stringify(user)
    );
}

function restoreSession() {
    const savedUser = localStorage.getItem("eventops-user");

    if (!savedUser) {
        showAuthentication();
        return;
    }

    try {
        state.currentUser = JSON.parse(savedUser);
        showApplication();
    } catch {
        localStorage.removeItem("eventops-user");
        showAuthentication();
    }
}

function showAuthentication() {
    document.getElementById("authPage").classList.remove("hidden");
    document.getElementById("application").classList.add("hidden");
}

async function showApplication() {
    document.getElementById("authPage").classList.add("hidden");
    document.getElementById("application").classList.remove("hidden");

    updateCurrentUserInterface();
    updateGreeting();
    await loadApplicationData();
}

function updateCurrentUserInterface() {
    const user = state.currentUser;

    if (!user) {
        return;
    }

    document.getElementById("currentUserName").textContent =
        user.fullName;

    document.getElementById("currentUserRole").textContent =
        formatEnum(user.role);

    document.getElementById("userAvatar").textContent =
        getInitials(user.fullName);
}

function updateGreeting() {
    const hour = new Date().getHours();

    let greeting = "Good evening";

    if (hour < 12) {
        greeting = "Good morning";
    } else if (hour < 17) {
        greeting = "Good afternoon";
    }

    const firstName =
        state.currentUser?.fullName?.trim().split(/\s+/)[0] || "User";

    document.getElementById("dashboardGreeting").textContent =
        `${greeting}, ${firstName}. Keep every event moving.`;
}

function initializeLogout() {
    document
        .getElementById("logoutButton")
        .addEventListener("click", () => {
            localStorage.removeItem("eventops-user");

            state.currentUser = null;
            state.events = [];
            state.requests = [];

            document.getElementById("loginForm").reset();
            document.getElementById("registerForm").reset();

            showAuthentication();
            showLoginForm();

            showToast(
                "success",
                "Signed out",
                "Your local session has been cleared."
            );
        });
}

/* =========================
   NAVIGATION
========================= */

function initializeNavigation() {
    document.querySelectorAll(".nav-item").forEach((button) => {
        button.addEventListener("click", () => {
            openSection(button.dataset.section);
        });
    });

    document
        .querySelectorAll("[data-open-section]")
        .forEach((button) => {
            button.addEventListener("click", () => {
                openSection(button.dataset.openSection);
            });
        });
}

function openSection(sectionId) {
    document.querySelectorAll(".app-section").forEach((section) => {
        section.classList.remove("active-section");
    });

    document
        .getElementById(sectionId)
        .classList.add("active-section");

    document.querySelectorAll(".nav-item").forEach((button) => {
        button.classList.toggle(
            "active",
            button.dataset.section === sectionId
        );
    });

    const details = pageDetails[sectionId];

    document.getElementById("pageEyebrow").textContent =
        details.eyebrow;

    document.getElementById("pageTitle").textContent =
        details.title;

    closeSidebar();

    if (sectionId === "dashboardSection") {
        renderDashboard();
    }

    if (sectionId === "eventsSection") {
        renderEvents();
    }

    if (sectionId === "requestsSection") {
        renderRequests();
    }

    window.scrollTo({ top: 0, behavior: "smooth" });
}

function initializeSidebar() {
    document
        .getElementById("openSidebarButton")
        .addEventListener("click", openSidebar);

    document
        .getElementById("closeSidebarButton")
        .addEventListener("click", closeSidebar);

    document
        .getElementById("sidebarOverlay")
        .addEventListener("click", closeSidebar);
}

function openSidebar() {
    document.getElementById("sidebar").classList.add("open");
    document.getElementById("sidebarOverlay").classList.add("visible");
}

function closeSidebar() {
    document.getElementById("sidebar").classList.remove("open");
    document
        .getElementById("sidebarOverlay")
        .classList.remove("visible");
}

/* =========================
   API
========================= */

async function apiRequest(endpoint, options = {}) {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        headers: {
            "Content-Type": "application/json",
            ...(options.headers || {})
        },
        ...options
    });

    const contentType = response.headers.get("content-type");
    const hasJson =
        contentType && contentType.includes("application/json");

    const data = hasJson ? await response.json() : null;

    if (!response.ok) {
        const validationMessages = data?.errors
            ? Object.values(data.errors).join(". ")
            : null;

        throw new Error(
            validationMessages ||
            data?.message ||
            `Request failed with status ${response.status}`
        );
    }

    return data;
}

async function loadApplicationData() {
    try {
        const [events, requests] = await Promise.all([
            apiRequest("/events"),
            apiRequest("/requests")
        ]);

        state.events = Array.isArray(events) ? events : [];
        state.requests = Array.isArray(requests) ? requests : [];

        renderAllData();
    } catch (error) {
        showToast(
            "error",
            "Unable to load dashboard",
            `${error.message}. Confirm that the backend is running.`
        );
    }
}

function renderAllData() {
    renderDashboard();
    renderEvents();
    renderEventOptions();
    renderRequests();
}

/* =========================
   DASHBOARD
========================= */

function renderDashboard() {
    const requests = state.requests;

    const total = requests.length;

    const closedStatuses = ["RESOLVED", "CLOSED", "CANCELLED"];

    const open = requests.filter(
        (request) => !closedStatuses.includes(request.status)
    ).length;

    const highImpact = requests.filter(
        (request) =>
            !closedStatuses.includes(request.status) &&
            ["HIGH", "CRITICAL"].includes(request.priority)
    ).length;

    const resolved = requests.filter(
        (request) =>
            request.status === "RESOLVED" ||
            request.status === "CLOSED"
    ).length;

    document.getElementById("totalRequestsStat").textContent = total;
    document.getElementById("openRequestsStat").textContent = open;
    document.getElementById("criticalRequestsStat").textContent =
        highImpact;
    document.getElementById("resolvedRequestsStat").textContent =
        resolved;

    const readiness = calculateReadiness(requests);

    document.getElementById("readinessValue").textContent =
        `${readiness}%`;

    document.getElementById("readinessRingValue").textContent =
        `${readiness}%`;

    document.getElementById("readinessRing").style.background =
        `conic-gradient(
            var(--green) 0deg ${readiness * 3.6}deg,
            var(--surface-secondary) ${readiness * 3.6}deg 360deg
        )`;

    let readinessMessage = "Operations look healthy";

    if (readiness < 50) {
        readinessMessage = "Immediate intervention required";
    } else if (readiness < 75) {
        readinessMessage = "Several issues need attention";
    } else if (readiness < 90) {
        readinessMessage = "Event is mostly prepared";
    }

    document.getElementById("readinessMessage").textContent =
        readinessMessage;

    renderPriorityQueue();
    renderRecentRequests();
}

function calculateReadiness(requests) {
    if (requests.length === 0) {
        return 100;
    }

    let penalty = 0;

    requests.forEach((request) => {
        if (["RESOLVED", "CLOSED", "CANCELLED"].includes(request.status)) {
            return;
        }

        const priorityPenalty = {
            CRITICAL: 25,
            HIGH: 15,
            MEDIUM: 8,
            LOW: 3
        };

        penalty += priorityPenalty[request.priority] || 3;
    });

    return Math.max(0, Math.min(100, 100 - penalty));
}

function renderPriorityQueue() {
    const container = document.getElementById("priorityQueue");

    const urgentRequests = state.requests
        .filter(
            (request) =>
                ["CRITICAL", "HIGH"].includes(request.priority) &&
                !["RESOLVED", "CLOSED", "CANCELLED"].includes(
                    request.status
                )
        )
        .slice(0, 4);

    if (urgentRequests.length === 0) {
        container.innerHTML = `
            <div class="empty-state compact-empty">
                <span>✓</span>
                <p>No urgent requests</p>
            </div>
        `;
        return;
    }

    container.innerHTML = urgentRequests
        .map(
            (request) => `
                <div class="compact-request">
                    <span class="compact-priority-dot
                                 ${escapeHtml(request.priority)}">
                    </span>

                    <div>
                        <strong>${escapeHtml(request.title)}</strong>
                        <p>
                            ${escapeHtml(request.requestCode)}
                            · ${escapeHtml(request.location)}
                        </p>
                    </div>

                    <span>${formatTimeRemaining(request.slaDeadline)}</span>
                </div>
            `
        )
        .join("");
}

function renderRecentRequests() {
    const container = document.getElementById("recentRequests");
    const recent = state.requests.slice(0, 6);

    if (recent.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <span>◎</span>
                <p>No support requests have been submitted yet.</p>
            </div>
        `;
        return;
    }

    container.innerHTML = `
        <table class="request-table">
            <thead>
                <tr>
                    <th>Request</th>
                    <th>Event</th>
                    <th>Category</th>
                    <th>Priority</th>
                    <th>Status</th>
                    <th>Created</th>
                </tr>
            </thead>

            <tbody>
                ${recent
                    .map(
                        (request) => `
                            <tr>
                                <td>
                                    <strong>
                                        ${escapeHtml(request.title)}
                                    </strong>
                                    <br>
                                    ${escapeHtml(request.requestCode)}
                                </td>

                                <td>${escapeHtml(request.eventName)}</td>

                                <td>${formatEnum(request.category)}</td>

                                <td>
                                    <span class="badge priority-${escapeHtml(
                                        request.priority
                                    )}">
                                        ${formatEnum(request.priority)}
                                    </span>
                                </td>

                                <td>
                                    <span class="badge status-${escapeHtml(
                                        request.status
                                    )}">
                                        ${formatEnum(request.status)}
                                    </span>
                                </td>

                                <td>${formatServerCreatedAt(request.createdAt)}</td>
                            </tr>
                        `
                    )
                    .join("")}
            </tbody>
        </table>
    `;
}

/* =========================
   EVENTS
========================= */

function initializeEventForm() {
    const panel = document.getElementById("eventFormPanel");

    document
        .getElementById("openEventFormButton")
        .addEventListener("click", () => {
            panel.classList.remove("hidden");
            panel.scrollIntoView({
                behavior: "smooth",
                block: "start"
            });
        });

    document
        .getElementById("closeEventFormButton")
        .addEventListener("click", () => {
            panel.classList.add("hidden");
        });

    document
        .getElementById("eventForm")
        .addEventListener("submit", handleEventCreation);
}

async function handleEventCreation(event) {
    event.preventDefault();

    const form = event.currentTarget;
    const button = form.querySelector('button[type="submit"]');

    const eventData = {
        name: document.getElementById("eventName").value.trim(),
        description:
            document.getElementById("eventDescription").value.trim() ||
            null,
        venue: document.getElementById("eventVenue").value.trim(),
        startDateTime: document.getElementById("eventStart").value,
        endDateTime: document.getElementById("eventEnd").value,
        expectedParticipants: Number(
            document.getElementById("eventParticipants").value
        ),
        createdByUserId: state.currentUser.userId
    };

    setButtonLoading(button, true, "Creating event...");

    try {
        const createdEvent = await apiRequest("/events", {
            method: "POST",
            body: JSON.stringify(eventData)
        });

        state.events.unshift(createdEvent);

        form.reset();
        document
            .getElementById("eventFormPanel")
            .classList.add("hidden");

        renderEvents();
        renderEventOptions();

        showToast(
            "success",
            "Event created",
            `${createdEvent.name} is ready for support planning.`
        );
    } catch (error) {
        showToast("error", "Event creation failed", error.message);
    } finally {
        setButtonLoading(button, false, "Create event");
    }
}

function renderEvents() {
    const container = document.getElementById("eventsGrid");

    if (state.events.length === 0) {
        container.innerHTML = `
            <div class="panel empty-state">
                <span>◇</span>
                <p>No events exist. Create your first college event.</p>
            </div>
        `;
        return;
    }

    container.innerHTML = state.events
        .map(
            (event) => `
                <article class="event-card">
                    <div class="event-card-accent"></div>

                    <div class="event-card-content">
                        <div class="event-card-top">
                            <span class="badge status-${escapeHtml(
                                event.status
                            )}">
                                ${formatEnum(event.status)}
                            </span>

                            <span class="request-code">
                                EVENT #${event.id}
                            </span>
                        </div>

                        <h3>${escapeHtml(event.name)}</h3>

                        <p class="event-card-description">
                            ${escapeHtml(
                                event.description ||
                                "No event description provided."
                            )}
                        </p>

                        <div class="event-meta">
                            <div>
                                <span>Venue</span>
                                <strong>${escapeHtml(event.venue)}</strong>
                            </div>

                            <div>
                                <span>Starts</span>
                                <strong>
                                    ${formatDate(event.startDateTime)}
                                </strong>
                            </div>

                            <div>
                                <span>Participants</span>
                                <strong>
                                    ${Number(
                                        event.expectedParticipants
                                    ).toLocaleString()}
                                </strong>
                            </div>

                            <div>
                                <span>Created by</span>
                                <strong>
                                    ${escapeHtml(event.createdByName)}
                                </strong>
                            </div>
                        </div>
                    </div>
                </article>
            `
        )
        .join("");
}

function renderEventOptions() {
    const select = document.getElementById("requestEvent");
    const selectedValue = select.value;

    select.innerHTML = `
        <option value="">Select an event</option>
        ${state.events
            .map(
                (event) => `
                    <option value="${event.id}">
                        ${escapeHtml(event.name)}
                        — ${escapeHtml(event.venue)}
                    </option>
                `
            )
            .join("")}
    `;

    if (
        selectedValue &&
        state.events.some(
            (event) => String(event.id) === selectedValue
        )
    ) {
        select.value = selectedValue;
    }
}

/* =========================
   SUPPORT REQUESTS
========================= */

function initializeRequestForm() {
    document
        .getElementById("supportRequestForm")
        .addEventListener("submit", handleSupportRequestCreation);
}

async function handleSupportRequestCreation(event) {
    event.preventDefault();

    const form = event.currentTarget;
    const button = form.querySelector('button[type="submit"]');

    const requestData = {
        eventId: Number(
            document.getElementById("requestEvent").value
        ),
        requestedByUserId: state.currentUser.userId,
        title: document.getElementById("requestTitle").value.trim(),
        description:
            document.getElementById("requestDescription").value.trim(),
        location:
            document.getElementById("requestLocation").value.trim(),
        participantsAffected: Number(
            document.getElementById("participantsAffected").value
        ),
        requiredBy:
            document.getElementById("requestRequiredBy").value
    };

    setButtonLoading(button, true, "Analyzing request...");

    try {
        const createdRequest = await apiRequest("/requests", {
            method: "POST",
            body: JSON.stringify(requestData)
        });

        state.requests.unshift(createdRequest);

        renderClassificationResult(createdRequest);
        renderDashboard();
        renderRequests();

        form.reset();

        showToast(
            "success",
            "Request classified and submitted",
            `${createdRequest.requestCode} was marked ` +
            `${formatEnum(createdRequest.priority)} priority.`
        );
    } catch (error) {
        showToast("error", "Request submission failed", error.message);
    } finally {
        setButtonLoading(
            button,
            false,
            "Analyze and submit request"
        );
    }
}

function renderClassificationResult(request) {
    document.getElementById("classificationPreview").innerHTML = `
        <div class="classification-result">
            <div>
                <span>Category</span>
                <strong>${formatEnum(request.category)}</strong>
            </div>

            <div>
                <span>Priority</span>
                <strong>${formatEnum(request.priority)}</strong>
            </div>

            <div>
                <span>Impact score</span>
                <strong>${request.impactScore}/100</strong>
            </div>

            <div>
                <span>SLA deadline</span>
                <strong>${formatDate(request.slaDeadline)}</strong>
            </div>
        </div>
    `;
}

function initializeFilters() {
    document
        .getElementById("requestSearch")
        .addEventListener("input", renderRequests);

    document
        .getElementById("statusFilter")
        .addEventListener("change", renderRequests);

    document
        .getElementById("priorityFilter")
        .addEventListener("change", renderRequests);
}

function renderRequests() {
    const container = document.getElementById("requestsGrid");

    const query =
        document.getElementById("requestSearch").value
            .trim()
            .toLowerCase();

    const status =
        document.getElementById("statusFilter").value;

    const priority =
        document.getElementById("priorityFilter").value;

    const filtered = state.requests.filter((request) => {
        const searchableText = [
            request.requestCode,
            request.title,
            request.description,
            request.location,
            request.eventName,
            request.category
        ]
            .join(" ")
            .toLowerCase();

        const matchesQuery =
            !query || searchableText.includes(query);

        const matchesStatus =
            status === "ALL" || request.status === status;

        const matchesPriority =
            priority === "ALL" || request.priority === priority;

        return matchesQuery && matchesStatus && matchesPriority;
    });

    if (filtered.length === 0) {
        container.innerHTML = `
            <div class="panel empty-state">
                <span>◎</span>
                <p>No support requests match the current filters.</p>
            </div>
        `;
        return;
    }

    container.innerHTML = filtered
        .map((request) => createRequestCard(request))
        .join("");
}

function createRequestCard(request) {
    return `
        <article class="request-card priority-${escapeHtml(
            request.priority
        )}">
            <div class="request-card-header">
                <div>
                    <p class="request-code">
                        ${escapeHtml(request.requestCode)}
                    </p>

                    <h3>${escapeHtml(request.title)}</h3>
                </div>

                <div class="badge-group">
                    <span class="badge priority-${escapeHtml(
                        request.priority
                    )}">
                        ${formatEnum(request.priority)}
                    </span>

                    <span class="badge status-${escapeHtml(
                        request.status
                    )}">
                        ${formatEnum(request.status)}
                    </span>
                </div>
            </div>

            <p class="request-description">
                ${escapeHtml(request.description)}
            </p>

            <div class="request-details">
                <div class="request-detail">
                    <span>Event</span>
                    <strong>${escapeHtml(request.eventName)}</strong>
                </div>

                <div class="request-detail">
                    <span>Location</span>
                    <strong>${escapeHtml(request.location)}</strong>
                </div>

                <div class="request-detail">
                    <span>Category</span>
                    <strong>${formatEnum(request.category)}</strong>
                </div>

                <div class="request-detail">
                    <span>Participants affected</span>
                    <strong>
                        ${Number(
                            request.participantsAffected
                        ).toLocaleString()}
                    </strong>
                </div>

                <div class="request-detail">
                    <span>SLA</span>
                    <strong>
                        ${formatTimeRemaining(request.slaDeadline)}
                    </strong>
                </div>

                <div class="request-detail">
                    <span>Impact score</span>
                    <strong>${request.impactScore}/100</strong>

                    <div class="impact-bar">
                        <span style="width:
                            ${Math.min(100, request.impactScore)}%">
                        </span>
                    </div>
                </div>
            </div>
                        ${createStatusAction(request)}
        </article>
    `;
}

function createStatusAction(request) {
    const nextStatusMap = {
        SUBMITTED: "ASSIGNED",
        ASSIGNED: "ACCEPTED",
        ACCEPTED: "IN_PROGRESS",
        IN_PROGRESS: "RESOLVED",
        RESOLVED: "CLOSED"
    };

    const actionLabelMap = {
        ASSIGNED: "Assign request",
        ACCEPTED: "Accept request",
        IN_PROGRESS: "Start work",
        RESOLVED: "Mark resolved",
        CLOSED: "Confirm and close"
    };

    const nextStatus = nextStatusMap[request.status];

    if (!nextStatus) {
        return request.resolutionNotes
            ? `
                <div class="resolution-summary">
                    <span>Resolution notes</span>
                    <p>${escapeHtml(request.resolutionNotes)}</p>
                </div>
              `
            : "";
    }

    const resolutionSummary = request.resolutionNotes
        ? `
            <div class="resolution-summary">
                <span>Resolution notes</span>
                <p>${escapeHtml(request.resolutionNotes)}</p>
            </div>
          `
        : "";

    return `
        ${resolutionSummary}

        <div class="request-card-actions">
            <div>
                <span>Next lifecycle step</span>
                <strong>
                    ${formatEnum(request.status)}
                    → ${formatEnum(nextStatus)}
                </strong>
            </div>

            <button
                class="primary-button compact-button"
                type="button"
                onclick="updateRequestStatus(
                    ${request.id},
                    '${nextStatus}'
                )">
                ${actionLabelMap[nextStatus]}
            </button>
        </div>
    `;
}

async function updateRequestStatus(requestId, newStatus) {
    let resolutionNotes = null;

    if (newStatus === "RESOLVED") {
        resolutionNotes = window.prompt(
            "Describe how the issue was resolved:"
        );

        if (resolutionNotes === null) {
            return;
        }

        if (resolutionNotes.trim().length === 0) {
            showToast(
                "error",
                "Resolution notes required",
                "Enter a short explanation of the completed work."
            );
            return;
        }
    }

    try {
        const updatedRequest = await apiRequest(
            `/requests/${requestId}/status`,
            {
                method: "PATCH",
                body: JSON.stringify({
                    status: newStatus,
                    resolutionNotes
                })
            }
        );

        const requestIndex = state.requests.findIndex(
            (request) => request.id === requestId
        );

        if (requestIndex !== -1) {
            state.requests[requestIndex] = updatedRequest;
        }

        renderDashboard();
        renderRequests();

        showToast(
            "success",
            "Request status updated",
            `${updatedRequest.requestCode} is now ` +
            `${formatEnum(updatedRequest.status)}.`
        );
    } catch (error) {
        showToast(
            "error",
            "Status update failed",
            error.message
        );
    }
}

/* =========================
   UTILITIES
========================= */

function setButtonLoading(button, loading, text) {
    button.disabled = loading;

    const firstSpan = button.querySelector("span");

    if (firstSpan) {
        firstSpan.textContent = text;
    } else {
        button.textContent = text;
    }
}

function showToast(type, title, message) {
    const container = document.getElementById("toastContainer");
    const toast = document.createElement("div");

    toast.className = `toast ${type}`;

    toast.innerHTML = `
        <span class="toast-icon">
            ${type === "success" ? "✓" : "!"}
        </span>

        <div>
            <strong>${escapeHtml(title)}</strong>
            <p>${escapeHtml(message)}</p>
        </div>
    `;

    container.appendChild(toast);

    window.setTimeout(() => {
        toast.remove();
    }, 5000);
}

function formatEnum(value) {
    if (!value) {
        return "Not available";
    }

    return String(value)
        .toLowerCase()
        .split("_")
        .map(
            (word) =>
                word.charAt(0).toUpperCase() + word.slice(1)
        )
        .join(" ");
}

function formatDate(value) {
    if (!value) {
        return "Not available";
    }

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
        return value;
    }

    return new Intl.DateTimeFormat("en-IN", {
        dateStyle: "medium",
        timeStyle: "short"
    }).format(date);
}

function formatServerCreatedAt(value) {
    if (!value) {
        return "Not available";
    }

    const hasTimeZone = /(?:Z|[+-]\d{2}:\d{2})$/i.test(value);
    const date = new Date(hasTimeZone ? value : `${value}Z`);

    if (Number.isNaN(date.getTime())) {
        return value;
    }

    return new Intl.DateTimeFormat("en-IN", {
        dateStyle: "medium",
        timeStyle: "short",
        timeZone: "Asia/Kolkata"
    }).format(date);
}

function formatTimeRemaining(value) {
    if (!value) {
        return "No SLA";
    }

    const difference =
        new Date(value).getTime() - Date.now();

    if (difference <= 0) {
        return "SLA breached";
    }

    const minutes = Math.floor(difference / 60000);

    if (minutes < 60) {
        return `${minutes} min remaining`;
    }

    const hours = Math.floor(minutes / 60);

    if (hours < 24) {
        return `${hours} hr remaining`;
    }

    const days = Math.floor(hours / 24);
    return `${days} day${days === 1 ? "" : "s"} remaining`;
}

function getInitials(name) {
    return String(name)
        .trim()
        .split(/\s+/)
        .slice(0, 2)
        .map((part) => part.charAt(0).toUpperCase())
        .join("");
}

function escapeHtml(value) {
    const element = document.createElement("div");
    element.textContent = value == null ? "" : String(value);
    return element.innerHTML;
}