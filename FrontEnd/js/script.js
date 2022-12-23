const baseUrl = "http://localhost:5678/api";
let modal = null;
let dataWorks = null;
let dataCategories = null;

function getCookie(cname) {
  let name = cname + "=";
  let decodedCookie = decodeURIComponent(document.cookie);
  let ca = decodedCookie.split(';');
  for(let i = 0; i <ca.length; i++) {
    let c = ca[i];
    while (c.charAt(0) == ' ') {
      c = c.substring(1);
    }
    if (c.indexOf(name) == 0) {
      return c.substring(name.length, c.length);
    }
  }
  return null;
}

let performRequest = async (path, method = 'GET', headers = {}, postData = {}) => {
    
    const response = method === 'POST' ?
        await fetch(baseUrl + path, {
            headers: headers,
            method: method,
            body: postData
        }) :
        await fetch(baseUrl + path, {
            headers: headers,
            method: method
        });
    
    if (response.ok) {
        const data = await response.json();
        return data;
    } else {
        throw new Error('Error occured while fetching works');
    }
        
}

let buildWorks = async (workAdded) => {
    if (isConnected()) document.getElementById('edit-works').classList.remove('hidden');

    if (dataWorks == null) dataWorks = await performRequest('/works');
    
    let gallery = document.querySelector('.gallery');

    if (gallery.querySelectorAll('figure').length > 0) {
        let figure = document.createElement('figure');
            figure.setAttribute('data-id', workAdded.id)
            figure.setAttribute('data-category', workAdded.category.name);
            figure.className = 'work';
            let img = document.createElement('img');
            img.setAttribute('src', workAdded.imageUrl);
            img.setAttribute('alt', workAdded.title);
            img.setAttribute('crossorigin', "anonymous")
            let figcaption = document.createElement('figcaption');
            figcaption.appendChild(document.createTextNode(workAdded.title));
            figure.appendChild(img);
            figure.appendChild(figcaption);
            gallery.appendChild(figure);
    } else {
        for (work of dataWorks) {
            let figure = document.createElement('figure');
            figure.setAttribute('data-id', work.id)
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
}

let buildFilters = async () => {
    dataCategories = await performRequest('/categories');
    let html = `<li data-name="all" class="filter__item filter__item--selected">Tous</li>`;
    for (category of dataCategories) {
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

let buildWorksForModal = (works) => {
    let html = ``;
    for (work of works) {
        html += 
        `<article class="modal-work"><span data-id="${work.id}" class="trash-icon"><i class="fa fa-regular fa-trash"></i></span>
            <img src="${work.imageUrl}" alt="${work.title}" crossorigin="anonymous">
            <span>Editer</span>
        </article>`;
    }
    document.querySelector('.div-works').innerHTML = html;
}

let removeWork = (workId) => {
    document.querySelector('.trash-icon[data-id="' + workId + '"]').remove()
    document.querySelector('.work[data-id="' + workId + '"]').remove();
    dataWorks = dataWorks.filter(work => work.id != workId);
}

let bindEvents = () => {
    //Delete icons
    document.querySelectorAll('.trash-icon').forEach(item => {
        item.addEventListener('click', e => {
            let workId = item.getAttribute('data-id');
            let headers = {
                'Authorization': 'Bearer ' + getCookie('token'),
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            }
            performRequest('/works/' + workId, 'DELETE', headers)
                .then(removeWork(workId))
                .catch(err => {
                    throw new Error(err)
                });
        })
    })

    document.querySelector('.js-previous').addEventListener('click', e => {
        document.getElementById('modal-title').textContent = 'Galerie photo';
        document.querySelector('.js-previous').classList.add('hidden');
        document.getElementById('add-form').classList.add('hidden');
        document.querySelector('.div-works').classList.remove('hidden');

        document.querySelector('.add-form-footer').classList.add('hidden');
        document.querySelector('.main-footer').classList.remove('hidden');
    })

    //Add button
    document.getElementById('add-work').addEventListener('click', e => {

        buildSelect();
        buildImgBlock();

        document.getElementById('modal-title').textContent = 'Ajout photo';
        document.querySelector('.js-previous').classList.remove('hidden');
        document.getElementById('add-form').classList.remove('hidden');
        document.querySelector('.div-works').classList.add('hidden');

        document.querySelector('.add-form-footer').classList.remove('hidden');
        document.querySelector('.main-footer').classList.add('hidden');
    })

    //Save work
    document.getElementById('save-work').addEventListener('click', e => {
        e.preventDefault();

        const formData = new FormData(document.getElementById('save-form'));

        let headers = {
            'Authorization': 'Bearer ' + getCookie('token')
        }

        performRequest('/works', 'POST', headers, formData)
            .then(data => {
                dataWorks.push(data);
                buildWorks(data);
            })
            .catch(err => { throw new Error(err)});
    })
    
    //Delete gallery
    document.getElementById('delete-gallery').addEventListener('click', e => {

    }) 
}

let buildImgBlock = () => {
    let container = document.querySelector('.container'),
        inputFile = document.querySelector('#file'),
        img, btn, txt = '+ Ajouter photo',
        txtAfter = 'Changer de photo'; 
    
    if (!container.querySelectorAll("#upload").length) {
        let input = document.createElement('input');
        input.type = 'button';
        input.value = txt;
        input.id = 'upload';
        container.querySelector('.input').append(input);
        
        let uploadImg = document.createElement('img');
        uploadImg.alt = 'altTxt';
        uploadImg.id = 'uploadImg';
        uploadImg.width = '100';
        uploadImg.className = 'hidden';
		container.prepend(uploadImg);
    }
    btn = document.querySelector('#upload');
    img = document.querySelector('#uploadImg');

    btn.addEventListener('click', function(){
		inputFile.click();
    });
    
    inputFile.addEventListener('change', function(e){
		container.querySelector('label').innerHTML = inputFile.value;
		
		var i = 0;
		for(i; i < e.target.files.length; i++) {
			var file = e.target.files[i], 
				reader = new FileReader();

			reader.onloadend = function(){
				img.src = reader.result;
			}
			reader.readAsDataURL(file);
            img.classList.remove('hidden');
		}
		
		btn.value = txtAfter;
	});
}

let buildSelect = () => {
    let select = document.getElementById('category');
    for (category of dataCategories) {
        let option = document.createElement('option');
        option.value = category.id;
        option.text = category.name;
        select.appendChild(option);
    }
}

const openModal = e => {
    e.preventDefault();
    const target = document.querySelector(e.target.getAttribute('href'));
    target.classList.remove('hidden');
    target.removeAttribute('aria-hidden');
    target.setAttribute('aria-modal', 'true');
    modal = target;
    modal.addEventListener('click', closeModal);
    modal.querySelector('.js-close-modal').addEventListener('click', closeModal);
    modal.querySelector('.js-modal-stop').addEventListener('click', e => e.stopPropagation());
    if (e.target.getAttribute('id') === 'edit-works') {
        buildWorksForModal(dataWorks);
        bindEvents();
    }
};

const closeModal = e => {
    if (modal === null) return;
    e.preventDefault();
    modal.classList.add('hidden');
    modal.setAttribute('aria-hidden', 'true');
    modal.removeAttribute('aria-modal');
    modal.querySelector('.js-close-modal').removeEventListener('click', closeModal);
    modal.querySelector('.js-modal-stop').removeEventListener('click', e => e.stopPropagation());
    modal = null;
}

document.querySelectorAll('.js-modal').forEach(item => {
    item.addEventListener('click', openModal);
});

let isConnected = () => {
    return getCookie('token') !== null;
}

buildFilters();
buildWorks();