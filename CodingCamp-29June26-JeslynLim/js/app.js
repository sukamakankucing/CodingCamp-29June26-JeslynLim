// ============================================================
// GREETING & CLOCK
// ============================================================

const timeEl     = document.getElementById("time")
const dateEl     = document.getElementById("date")
const greetingEl = document.getElementById("greeting")
const nameInput  = document.getElementById("nameInput")

function updateTime() {
    const now     = new Date()
    const hours   = now.getHours()
    const minutes = now.getMinutes()
    const seconds = now.getSeconds()

    timeEl.textContent = [hours, minutes, seconds]
        .map(n => String(n).padStart(2, "0"))
        .join(":")

    dateEl.textContent = now.toLocaleDateString("en-US", {
        weekday: "long",
        year:    "numeric",
        month:   "long",
        day:     "numeric"
    })

    const savedName = localStorage.getItem("userName")
    const namePart  = savedName ? ", " + savedName : ""

    if (hours < 12) {
        greetingEl.textContent = "Good Morning" + namePart + "!"
    } else if (hours < 18) {
        greetingEl.textContent = "Good Afternoon" + namePart + "!"
    } else {
        greetingEl.textContent = "Good Evening" + namePart + "!"
    }
}

updateTime()
setInterval(updateTime, 1000)


// ============================================================
// CUSTOM NAME
// ============================================================

// Pre-fill input with saved name
const savedName = localStorage.getItem("userName")
if (savedName) nameInput.value = savedName

document.getElementById("saveName").addEventListener("click", function () {
    const name = nameInput.value.trim()
    if (name === "") {
        localStorage.removeItem("userName")
    } else {
        localStorage.setItem("userName", name)
    }
    updateTime()
})


// ============================================================
// FOCUS TIMER
// ============================================================

const timerEl = document.getElementById("timer")
let totalSeconds  = 0
let timerInterval = null
let originalTime  = "25:00"

function displayTime() {
    const m = Math.floor(totalSeconds / 60)
    const s = totalSeconds % 60
    timerEl.textContent =
        String(m).padStart(2, "0") + ":" +
        String(s).padStart(2, "0")
}

// Preset buttons (25 / 10 / 5 min)
document.querySelectorAll(".preset-btn").forEach(function (btn) {
    btn.addEventListener("click", function () {
        if (timerInterval) return   // don't change while running
        timerEl.textContent = btn.getAttribute("data-time")
    })
})

document.getElementById("Start").addEventListener("click", function () {
    if (timerInterval) return

    const text  = timerEl.textContent.trim()
    originalTime = text

    const parts = text.split(":")
    const m     = parseInt(parts[0]) || 0
    const s     = parseInt(parts[1]) || 0
    totalSeconds = (m * 60) + s

    if (totalSeconds <= 0) return

    timerEl.contentEditable = "false"

    timerInterval = setInterval(function () {
        if (totalSeconds <= 0) {
            clearInterval(timerInterval)
            timerInterval = null
            timerEl.textContent = "Time's up!"
            return
        }
        totalSeconds--
        displayTime()
    }, 1000)
})

document.getElementById("Stop").addEventListener("click", function () {
    clearInterval(timerInterval)
    timerInterval = null
    timerEl.contentEditable = "true"
})

document.getElementById("Reset").addEventListener("click", function () {
    clearInterval(timerInterval)
    timerInterval = null
    totalSeconds = 0
    timerEl.textContent    = originalTime
    timerEl.contentEditable = "true"
})


// ============================================================
// TO-DO LIST
// ============================================================

const taskInput    = document.getElementById("taskInput")
const taskList     = document.getElementById("taskList")
const duplicateMsg = document.getElementById("duplicateMsg")

function addTask(text, done = false) {
    const li        = document.createElement("li")
    const leftDiv   = document.createElement("div")
    const checkbox  = document.createElement("input")
    const span      = document.createElement("span")
    const editBtn   = document.createElement("button")
    const deleteBtn = document.createElement("button")

    checkbox.type    = "checkbox"
    checkbox.checked = done

    span.textContent = text
    if (done) span.style.textDecoration = "line-through"

    editBtn.textContent   = "Edit"
    editBtn.className     = "editBtn"
    deleteBtn.textContent = "Delete"

    leftDiv.appendChild(checkbox)
    leftDiv.appendChild(span)
    li.appendChild(leftDiv)
    li.appendChild(editBtn)
    li.appendChild(deleteBtn)
    taskList.appendChild(li)

    checkbox.addEventListener("change", function () {
        span.style.textDecoration = checkbox.checked ? "line-through" : "none"
        saveTasks()
    })

    editBtn.addEventListener("click", function () {
        const currentText = span.textContent
        const input       = document.createElement("input")
        input.type        = "text"
        input.value       = currentText
        input.className   = "editInput"

        span.replaceWith(input)
        input.focus()
        input.select()

        function saveEdit() {
            const newText = input.value.trim()
            if (newText === "" || newText === currentText) {
                input.replaceWith(span)
                return
            }
            // Check for duplicates (excluding current task)
            const allSpans = taskList.querySelectorAll("span")
            for (let i = 0; i < allSpans.length; i++) {
                if (allSpans[i].textContent.toLowerCase() === newText.toLowerCase()) {
                    duplicateMsg.style.display = "block"
                    setTimeout(function () { duplicateMsg.style.display = "none" }, 2000)
                    input.replaceWith(span)
                    return
                }
            }
            duplicateMsg.style.display = "none"
            span.textContent = newText
            input.replaceWith(span)
            saveTasks()
        }

        input.addEventListener("blur", saveEdit)
        input.addEventListener("keypress", function (e) {
            if (e.key === "Enter") saveEdit()
        })
        input.addEventListener("keydown", function (e) {
            if (e.key === "Escape") {
                input.replaceWith(span)
            }
        })
    })

    deleteBtn.addEventListener("click", function () {
        taskList.removeChild(li)
        saveTasks()
    })
}

function isDuplicate(text) {
    const existing = taskList.querySelectorAll("span")
    for (let i = 0; i < existing.length; i++) {
        if (existing[i].textContent.toLowerCase() === text.toLowerCase()) return true
    }
    return false
}

function saveTasks() {
    const tasks = []
    taskList.querySelectorAll("li").forEach(function (li) {
        tasks.push({
            text: li.querySelector("span").textContent,
            done: li.querySelector("input[type=checkbox]").checked
        })
    })
    localStorage.setItem("tasks", JSON.stringify(tasks))
}

function loadTasks() {
    const saved = localStorage.getItem("tasks")
    if (saved) JSON.parse(saved).forEach(function (task) {
        addTask(task.text, task.done)
    })
}

document.getElementById("addTask").addEventListener("click", function () {
    const text = taskInput.value.trim()
    if (text === "") return

    if (isDuplicate(text)) {
        duplicateMsg.style.display = "block"
        setTimeout(function () { duplicateMsg.style.display = "none" }, 2000)
        return
    }

    duplicateMsg.style.display = "none"
    addTask(text)
    taskInput.value = ""
    saveTasks()
})

taskInput.addEventListener("keypress", function (e) {
    if (e.key === "Enter") document.getElementById("addTask").click()
})

loadTasks()


// ============================================================
// QUICK LINKS
// ============================================================

const linkList = document.getElementById("linkList")

function addLink(name, url) {
    const wrapper   = document.createElement("span")
    const a         = document.createElement("a")
    const deleteBtn = document.createElement("button")

    a.textContent = name
    a.href        = url
    a.target      = "_blank"

    deleteBtn.textContent = "x"
    deleteBtn.className   = "deleteLink"
    deleteBtn.addEventListener("click", function () {
        linkList.removeChild(wrapper)
        saveLinks()
    })

    wrapper.appendChild(a)
    wrapper.appendChild(deleteBtn)
    linkList.appendChild(wrapper)
}

function saveLinks() {
    const links = []
    linkList.querySelectorAll("span").forEach(function (span) {
        links.push({
            name: span.querySelector("a").textContent,
            url:  span.querySelector("a").href
        })
    })
    localStorage.setItem("links", JSON.stringify(links))
}

function loadLinks() {
    const saved = localStorage.getItem("links")
    if (saved) JSON.parse(saved).forEach(function (link) {
        addLink(link.name, link.url)
    })
}

document.getElementById("addLink").addEventListener("click", function () {
    const name = document.getElementById("linkName").value.trim()
    let   url  = document.getElementById("linkURL").value.trim()
    if (name === "" || url === "") return
    if (!url.startsWith("http")) url = "https://" + url
    addLink(name, url)
    document.getElementById("linkName").value = ""
    document.getElementById("linkURL").value  = ""
    saveLinks()
})

loadLinks()
