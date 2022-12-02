const baseUrl = "http://localhost:5678/api";

let performGET = async (path) => {
    
    const response = await fetch(baseUrl + path);
    if (response.ok) {
        const data = await response.json();
        return data;
    } else {
        throw new Error('Error occured while fetching works');
    }
        
}

let buildWorks = async () => {
    let works = await performGET('/works');
    let gallery = document.querySelector('.gallery');
    for (work of works) {
        let figure = document.createElement('figure');
        figure.setAttribute('data-category', work.category.name);
        figure.className = 'work';
        let img = document.createElement('img');
        img.setAttribute('src', work.imageUrl);
        img.setAttribute('alt', work.title);
        img.setAttribute('crossorigin', "anonymous")
        let figcaption = document.createElement('figcaption');
        figcaption.appendChild(document.createTextNode(work.title));
        figure.appendChild(img);
        figure.appendChild(figcaption);
        gallery.appendChild(figure);
    }
}

let buildFilters = async () => {
    let categories = await performGET('/categories');
    let html = `<li data-name="all" class="filter__item filter__item--selected">Tous</li>`;
    for (category of categories) {
        html += `<li data-name="${category.name}" class="filter__item">${category.name}</li>`;
    }
    document.querySelector('.filter').innerHTML = html;
    
    document.querySelectorAll('.filter__item').forEach(item => {
    item.addEventListener('click', e => {
        performFiltering(e.target);
    })
});
}

let updateFilters = (item) => {
    document.querySelectorAll('.filter__item').forEach(elt => {
        elt.classList.remove('filter__item--selected');
    });
    if (!item.classList.contains('filter__item--selected')) {
        item.classList.add('filter__item--selected');
    }
}

let performFiltering = (category) => {
    document.querySelectorAll('.work').forEach(item => {
        if (category.getAttribute('data-name') == 'all') {
            item.classList.remove('hidden');
        } else if (item.getAttribute('data-category') == category.getAttribute('data-name')) {
            item.classList.remove('hidden');
        } else {
            item.classList.add('hidden');
        }
    });
    updateFilters(category);
}

buildFilters();
buildWorks();



