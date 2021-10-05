function toggle_visibility(foo){
    const e = document.getElementById(foo);
    if(e.style.display == 'block')
        e.style.display = 'none';
    else
        e.style.display = 'block';
}