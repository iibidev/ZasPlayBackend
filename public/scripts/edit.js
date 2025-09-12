const swiper = new Swiper('.mySwiper', {
  slidesPerView: 3.5,
  spaceBetween: 30,
});

const $ = el => document.querySelector(el);
const $$ = el => document.querySelectorAll(el);

const avataresFotos = [
    "https://res.cloudinary.com/dzwufjd9o/image/upload/v1750801760/AvatarMaker_zm7dot.webp",
    "https://res.cloudinary.com/dzwufjd9o/image/upload/v1750801760/AvatarMaker_2_qq98tm.webp",
    "https://res.cloudinary.com/dzwufjd9o/image/upload/v1750801759/AvatarMaker_3_uiaar5.webp",
    "https://res.cloudinary.com/dzwufjd9o/image/upload/v1750801759/AvatarMaker_1_pyzmwc.webp",
    "https://res.cloudinary.com/dzwufjd9o/image/upload/v1750801760/AvatarMaker_5_lv45g1.webp",
    "https://res.cloudinary.com/dzwufjd9o/image/upload/v1750801759/AvatarMaker_4_xkqpbg.webp"
];

const $form = $(".editForm");
const $loader = $(".loader");
const $picOptions = $(".picOptions");
const $picAvatares = $(".avatares");
const $back = $(".back");
const $avatares = $(".swiper-wrapper");
const $errorMsg = $("#errorMsg");
const $changePic = $("#changePic");

const usernameRegex = /^[a-zA-Z0-9_-]{4,16}$/;
let selectedAvatar;

avataresFotos.forEach(foto =>{
    const slide = document.createElement("div");
    const img = document.createElement("img");
    img.src = foto;
    img.classList.add("profilePic");
    slide.classList.add("swiper-slide");

    slide.appendChild(img);
    $avatares.appendChild(slide);
});

const pics = $$(".profilePic");

pics.forEach(pic =>{
    pic.addEventListener("click", ()=>{
        pics.forEach(pic =>{
            pic.classList.remove("picSelected");
        });
        pic.classList.add("picSelected");
        selectedAvatar = pic.src;        
    });
});

$form.addEventListener("submit", async(evt)=>{
    evt.preventDefault();
    const $username = $("#username");
    $username.value = $username.value.trim();

    if($username.value == ""){
        showError("No se puede dejar vacío el campo");
        return;
    }

    const isUsernameValid = usernameRegex.test($username.value);

    if(!isUsernameValid){
        showError("Formato incorrecto");
        return;
    }

    try {
        $loader.style.display = "flex";
        const response = await fetch("/auth/update", {
            method: "PUT",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                username: $username.value
            }),
            credentials: "include"
        });

        const data = await response.json();

        if(data.ok){      
            $loader.style.display = "none";
        }else{
            showError(data);
            $loader.style.display = "none";
        }

    } catch (error) {
        console.log(error);        
        $loader.style.display = "none";
    }
});

$changePic.addEventListener("change", async(evt)=>{
    $picOptions.style.display = "none";
    const $pic = $("#profilePic");
    const formData = new FormData();

    const file = evt.target.files[0];
    if(file){
        formData.append("profilePic", file);
        closePicOptions();
        try {
            $loader.style.display = "flex";
            const response = await fetch("/auth/updatePic", {
                method: "PUT",
                body: formData,
                credentials: "include"
            });

            const data = await response.json();

            if(data.ok){ 
                $pic.src = data.profilePic;      
                $loader.style.display = "none";
            }else{
                showError(data.error);        
                $loader.style.display = "none";
            }

        } catch (error) {
            console.log(error);        
            $loader.style.display = "none";
        }
    }
    
});

function openPicOptions(){
    $picOptions.style.display = "flex";
    $back.style.display = "block";
}

function openPicAvatars(){
    $picOptions.style.display = "none";
    $picAvatares.style.display = "flex";
}

function closePicOptions(){
    $picOptions.style.display = "none";
    $back.style.display = "none";
    $picAvatares.style.display = "none";
}

function showError(msg){
    $errorMsg.innerHTML = msg;
    setTimeout(()=>{
        $errorMsg.innerHTML = "";
    }, 3000); 
}

async function changeAvatar(){
    if(selectedAvatar){
        try {
            $loader.style.display = "flex";
            closePicOptions();

            const response = await fetch("/auth/updateAvatar", {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    avatar: selectedAvatar
                }),
                credentials: "include"
            });

            const data = await response.json();

            if (data.ok) {
                const $profilePic = $("#profilePic");
                $profilePic.src = data.profilePic;
                $loader.style.display = "none";
            }else{
                $loader.style.display = "none";
            }
        } catch (error) {
            console.log(error);
            $loader.style.display = "none";
        }
    }
}