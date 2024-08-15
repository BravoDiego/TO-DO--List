function sortTasksByDueDate(tasks) {
    return tasks.sort((a, b) => {
        // Convertir les dates au format 'dd/mm/yyyy' en objets Date
        const dateA = convertToDate(a.for);
        const dateB = convertToDate(b.for);

        // Comparer les deux dates
        return dateA - dateB;
    });
}

// Fonction pour convertir une date au format 'dd/mm/yyyy' en objet Date
function convertToDate(dateStr) {
    const [day, month, year] = dateStr.split('/').map(Number);
    return new Date(year, month - 1, day); // Mois est indexé à partir de 0
}

function formatDateTime(date) {
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear();
    
    return `${hours}:${minutes}, ${day}/${month}/${year}`;
}

function formatDueDate(date) {
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear();
    
    return `${day}/${month}/${year}`;
}

function deleteTaskById(taskId) {
    // Utiliser filter pour créer un nouveau tableau sans la tâche avec l'id donné
    tasks_list = tasks_list.filter(task => task.id !== taskId);
    console.log("Tâche supprimée. Nouvelle liste :", tasks_list);

    // Réinitialiser le DOM
    const tasks_ul = document.getElementById('tasks-ul');
    tasks_ul.innerHTML = '';
    updateTasksDisplay();
}

function checkbox_click(ele) {
    let id_str = ele.name.split("-").pop(); // Récupérer le dernier élément
    let taskId = parseInt(id_str, 10);
    let title = document.querySelector(`h3[name='${id_str}']`);
    if (title) {
        title.style.textDecoration = ele.checked ? "line-through" : "none";

        let task = tasks_list.find(task => task.id === taskId);
        if (task) {
            // Mettre à jour la propriété 'done' de la tâche
            task.done = ele.checked;
            console.log(`Tâche ${taskId} mise à jour : ${task.done}`);
        } else {
            console.log(`Tâche avec l'ID ${taskId} non trouvée.`);
        }
    }
}

function create_attribute_class(ele, class_name) {
    const element = document.createElement(ele);
    element.className = class_name;
    return element;
}

function updateTasksDisplay() {
    const selectMenu = document.getElementById('select-menu');
    const filterValue = selectMenu.value;

    let filteredTasks = [];
    const now = new Date();
    const todayStr = formatDueDate(now);

    switch (filterValue) {
        case 'all':
            filteredTasks = tasks_list;
            break;
        case 'today':
            filteredTasks = tasks_list.filter(task => task.for === todayStr);
            break;
        case 'delayed':
            filteredTasks = tasks_list.filter(task => {
                const taskDate = convertToDate(task.for);
                return taskDate < now;
            });
            break;
        case 'done':
            filteredTasks = tasks_list.filter(task => task.done);
            break;
    }

    // Réinitialiser le DOM
    const tasks_ul = document.querySelector("#tasks-ul");
    tasks_ul.innerHTML = '';

    // Réafficher les tâches filtrées
    filteredTasks = sortTasksByDueDate(filteredTasks)
    filteredTasks.forEach((ele) => render_task(ele));
}

function render_task(task) {
    console.log("Rendu de la tâche :", task);

    const li = create_attribute_class("li", "tasks-li");
    const article = create_attribute_class("article", "task-component");
    li.appendChild(article);

    const label = create_attribute_class("label", "toggle-task");
    const input_chekcbox = create_attribute_class("input", "checkbox-task");
    input_chekcbox.name = "checkbox-task-" + task.id;
    input_chekcbox.type = "checkbox";
    input_chekcbox.checked = task.done;
    input_chekcbox.addEventListener('click', function() {
        checkbox_click(input_chekcbox);
    });

    const span_checkmark = create_attribute_class("span", "checkmark");
    label.append(input_chekcbox, span_checkmark);

    const info_task = create_attribute_class("div", "info-task");
    const title = create_attribute_class("h3", "title-task");
    title.setAttribute("name", task.id);
    title.textContent = task.title;
    if (task.done) {
        title.style.textDecoration = "line-through";
    }

    const date_info_task = create_attribute_class("div", "date-info-task");
    const created_date = create_attribute_class("span", "date-create-task");
    created_date.textContent = task.created;
    const span_to_do_for = document.createElement("span");
    span_to_do_for.textContent = " to do for ";
    const span_date_to_do = create_attribute_class("span", "date-to-do-task");
    span_date_to_do.textContent = task.for;
    date_info_task.append(created_date, span_to_do_for, span_date_to_do);
    info_task.append(title, date_info_task);

    const btn_task = create_attribute_class("div", "btn-task");
    const btn_suppr_task = create_attribute_class("button", "btn-suppr-task");
    btn_suppr_task.name = task.id;
    btn_suppr_task.addEventListener("click", function() {
        deleteTaskById(parseInt(btn_suppr_task.name));
    });
    const ion_icon_trash = document.createElement("ion-icon");
    ion_icon_trash.name = "trash";
    btn_suppr_task.appendChild(ion_icon_trash);

    const btn_edit_task = create_attribute_class("button", "btn-edit-task");
    btn_edit_task.addEventListener("click", function() {
        showEditForm(task);
    });
    const ion_icon_create = document.createElement("ion-icon");
    ion_icon_create.name = "create";
    btn_edit_task.appendChild(ion_icon_create);

    btn_task.append(btn_suppr_task, btn_edit_task);
    article.append(label, info_task, btn_task);
    document.getElementById('tasks-ul').appendChild(li);
}

function downloadJSON() {
    // Convertir les données JSON en chaîne de caractères
    const jsonStr = JSON.stringify(tasks_list, null, 2);

    // Créer un blob à partir du JSON
    const blob = new Blob([jsonStr], { type: "application/json" });

    // Créer une URL temporaire pour le téléchargement
    const url = URL.createObjectURL(blob);

    // Créer un élément <a> caché pour déclencher le téléchargement
    const a = document.createElement("a");
    a.href = url;
    a.download = "tasks.json"; // Nom du fichier JSON téléchargé
    document.body.appendChild(a);
    a.click();

    // Supprimer l'élément <a> après le téléchargement
    document.body.removeChild(a);
}

function showEditForm(task) {
    let editTaskSection = document.getElementById('edit-task');
    document.getElementById('edit-task-title').value = task.title;
    document.getElementById('edit-task-deadline').value = task.for;
    
    // Stocker l'ID de la tâche à modifier dans un attribut data
    if (editTaskSection.classList.contains('show')) {
        editTaskSection.classList.remove('show');
        // Attendre que la transition se termine avant de masquer complètement l'élément
        setTimeout(() => {
            editTaskSection.style.display = 'none';
        }, 300); // La durée de la transition CSS
    } else {
        editTaskSection.style.display = 'flex';
        setTimeout(() => {
            editTaskSection.classList.add('show');
        }, 10); // Ajouter un léger délai pour que le display:block prenne effet avant la transition
    }
    editTaskSection.dataset.taskId = task.id; // Stocke l'ID de la tâche à modifier
}

var tasks_list = [];

document.getElementById('input-fil-import').addEventListener('change', function(event) {
    console.log("Événement 'change' détecté");
    const file = event.target.files[0]; // Récupérer le fichier sélectionné
    if (file && file.type === "application/json") { // Vérifier que c'est bien un fichier JSON
        const reader = new FileReader();
        
        // Lire le fichier comme du texte
        reader.onload = function(e) {
            try {
                const jsonContent = JSON.parse(e.target.result); // Parser le contenu JSON
                console.log("Contenu JSON importé:", jsonContent);
                tasks_list = jsonContent;
                
                // Réinitialiser le DOM
                const tasks_ul = document.querySelector("#tasks-ul");
                tasks_ul.innerHTML = '';

                // Réafficher les tâches
                tasks_list = sortTasksByDueDate(tasks_list);
                updateTasksDisplay();
            } catch (error) {
                alert('Erreur de lecture du fichier JSON: ' + error.message);
            }
        };

        reader.readAsText(file); // Lire le fichier
    } else {
        alert("Veuillez sélectionner un fichier JSON valide.");
    }
});

document.getElementById("btn-export").addEventListener("click", downloadJSON);
document.getElementById('select-menu').addEventListener('change', updateTasksDisplay);
updateTasksDisplay();

document.getElementById('btn-add-task').addEventListener('click', function() {
    const createTaskSection = document.getElementById('create-task');

    // Ajouter ou retirer la classe 'show' pour gérer l'animation
    if (createTaskSection.classList.contains('show')) {
        createTaskSection.classList.remove('show');
        // Attendre que la transition se termine avant de masquer complètement l'élément
        setTimeout(() => {
            createTaskSection.style.display = 'none';
        }, 300); // La durée de la transition CSS
    } else {
        createTaskSection.style.display = 'flex';
        setTimeout(() => {
            createTaskSection.classList.add('show');
        }, 10); // Ajouter un léger délai pour que le display:block prenne effet avant la transition
    }
});

document.getElementById('btn-submit-new-task').addEventListener('click', function() {
    // Récupérer les valeurs des champs
    const title = document.getElementById('task-title').value;
    const deadline = document.getElementById('task-deadline').value;

    // Vérifier que les valeurs ne sont pas vides
    if (title && deadline) {
        // Créer une nouvelle tâche
        const deadlineDate = new Date(deadline);

        // Formater les dates
        const createdDate = formatDateTime(new Date()); // Date actuelle
        const dueDate = formatDueDate(deadlineDate);

        const newTask = {
            id: tasks_list.length > 0 ? Math.max(...tasks_list.map(task => task.id)) + 1 : 0,
            title: title,
            created: createdDate, // Date et heure actuelles
            for: dueDate,
            done: false
        };

        // Ajouter la nouvelle tâche à la liste
        tasks_list.push(newTask);

        // Réinitialiser le DOM
        const tasks_ul = document.querySelector("#tasks-ul");
        tasks_ul.innerHTML = '';

        // Réafficher toutes les tâches
        updateTasksDisplay();

        // Réinitialiser les champs de saisie
        document.getElementById('task-title').value = '';
        document.getElementById('task-deadline').value = '';

        // Cacher la section #create-task
        const createTaskSection = document.getElementById('create-task');
        createTaskSection.classList.remove('show');
        setTimeout(() => {
            createTaskSection.style.display = 'none';
        }, 300); // La durée de la transition CSS
    } else {
        alert("Veuillez remplir tous les champs.");
    }
});

document.getElementById('btn-submit-edit-task').addEventListener('click', function() {
    const title = document.getElementById('edit-task-title').value;
    const deadline = document.getElementById('edit-task-deadline').value;
    
    if (title && deadline) {
        // Trouver l'id de la tâche à modifier depuis l'attribut data
        const taskId = parseInt(document.getElementById('edit-task').dataset.taskId);
        
        // Trouver la tâche existante
        const taskIndex = tasks_list.findIndex(task => task.id === taskId);
        
        if (taskIndex !== -1) {
            // Mettre à jour la tâche
            const deadlineDate = new Date(deadline);
            const updatedTask = {
                ...tasks_list[taskIndex],
                title: title,
                for: formatDueDate(deadlineDate)
            };

            // Remplacer la tâche dans la liste
            tasks_list[taskIndex] = updatedTask;

            // Réinitialiser le DOM
            const tasks_ul = document.querySelector("#tasks-ul");
            tasks_ul.innerHTML = '';

            updateTasksDisplay();

            // Réinitialiser le formulaire d'édition
            document.getElementById('edit-task-title').value = '';
            document.getElementById('edit-task-deadline').value = '';

            // Cacher le formulaire d'édition
            const editTaskSection = document.getElementById('edit-task');
            editTaskSection.classList.remove('show');
            setTimeout(() => {
                editTaskSection.style.display = 'none';
            }, 300); // Durée de la transition CSS
        } else {
            alert("Tâche non trouvée.");
        }
    } else {
        alert("Veuillez remplir tous les champs.");
    }
});


document.getElementById('btn-cancel-edit-task').addEventListener('click', function() {
    // Réinitialiser le formulaire d'édition
    document.getElementById('edit-task-title').value = '';
    document.getElementById('edit-task-deadline').value = '';

    // Cacher le formulaire d'édition
    const editTaskSection = document.getElementById('edit-task');
    editTaskSection.classList.remove('show');
    setTimeout(() => {
        editTaskSection.style.display = 'none';
    }, 300); // Durée de la transition CSS
});

document.getElementById('btn-cancel-new-task').addEventListener('click', function() {
    // Cacher le formulaire d'édition
    const createTaskSection = document.getElementById('create-task');
    createTaskSection.classList.remove('show');
    setTimeout(() => {
        createTaskSection.style.display = 'none';
    }, 300); // Durée de la transition CSS
});