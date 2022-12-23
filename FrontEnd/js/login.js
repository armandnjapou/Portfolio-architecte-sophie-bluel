const baseUrl = "http://localhost:5678/api";
const emailPattern = new RegExp("^[a-z0-9_.]+@[a-z]{2,20}\.[a-z]{2,5}$");
const basePath = '/Frontend';

function setCookie(cname, cvalue, exdays) {
  const d = new Date();
  d.setTime(d.getTime() + (exdays*24*60*60*1000));
  let expires = "expires="+ d.toUTCString();
  document.cookie = cname + "=" + cvalue + ";" + expires + ";path=/";
}

let performPost = async (path, headers = {}, data) => {
    let response = await fetch(baseUrl + path, {
        method: 'POST',
        headers: headers,
        body: JSON.stringify(data)
    });
    if (response.ok) {
        const data = await response.json();
        return data;
    } else {
        throw new Error('Error occured while posting data');
    }
}

let isEmailValid = (email) => {
    return emailPattern.test(email);
}

document.getElementById('send-form').addEventListener('click', e => {
    e.preventDefault();
    
    let postData = {
        email: document.getElementById('email').value,
        password: document.getElementById('password').value
    }
  if (isEmailValid(postData.email)) {
    document.getElementById('email-error').classList.add('hidden');
    let headers = {
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    }
    performPost('/users/login', headers, postData).then(data => {
      window.location.href = basePath + '/index.html';
      setCookie('token', data.token, 1);
    }).catch(err => {
      document.querySelector('.form-error').classList.remove('hidden');
      console.error(err);
    });
    } else {
      document.getElementById('email-error').classList.remove('hidden');
    }
});