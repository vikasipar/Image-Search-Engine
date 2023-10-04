const imagesWrapper = document.querySelector(".images");
const loadMoreBtn = document.querySelector(".load-more");
const searchInput = document.querySelector(".search-box input");
const lightBox = document.querySelector(".lightbox");
const closeBtn = lightBox.querySelector(".uil-times");
const downloadImgBtn = lightBox.querySelector(".uil-import");

const apikey = process.env.API_KEY;
const perPage = 15;
let currentPage = 1;
let searchTerm = null;

const downloadImg = (imgURL) => {
    // converting img to blob, creating its download link & downloading it
    fetch(imgURL).then(res => res.blob()).then(file => {
        const a = document.createElement("a");
        a.href = URL.createObjectURL(file);
        a.download = new Date().getTime();
        a.click();
    }).catch(() => alert("Failed to download image!"));
}

const showLightbox = (photographerName, imgSrc) => {
    lightBox.querySelector("img").src = imgSrc;
    lightBox.querySelector("span").innerText = photographerName;
    downloadImgBtn.setAttribute("data-img", imgSrc);
    lightBox.classList.add("show");
    document.body.style.overflow = "hidden";
}

const hideLightbox = () => {
    lightBox.classList.remove("show");
    document.body.style.overflow = "auto";
}

const generateHTML = (images) => {
    imagesWrapper.innerHTML += images.map(image => 
        // stopPropagation() prevents propagation of the same event from being called 
        `<li class="cards" onclick="showLightbox('${image.photographer}', '${image.src.large2x}')">
                <img src="${image.src.large2x}" alt="img">
                <div class="details">
                    <div class="photographer">
                        <div class="uil uil-camera"></div>
                        <span>${image.photographer}</span>
                    </div>
                    <button onclick="downloadImg('${image.src.large2x}');event.stopPropagation();">  
                        <i class="uil uil-import"></i>
                    </button>
                </div>
            </li>`
        
        ).join("");
}

const getImages = (apiURL) => {
    // during images fetching
    loadMoreBtn.innerText = "Loading..";
    loadMoreBtn.classList.add("disabled");
    fetch(apiURL, {
        headers: { Authorization: apikey}
    }).then(res => res.json()).then(data => {
        generateHTML(data.photos);
    // after images fetching
        loadMoreBtn.innerText = "Load More";
        loadMoreBtn.classList.remove("disabled");
    }).catch(() => alert("Failed to load images!"));
}

const loadMoreImages = () => {
    currentPage = currentPage + 1;
    let apiURL = `https://api.pexels.com/v1/curated?page=${currentPage}&per_page=${perPage}`;
    //if searchTerm has some value then call API with searchTerm else call default API
    apiURL = searchTerm ? `https://api.pexels.com/v1/search?query=${searchTerm}&page=${currentPage}&per_page=${perPage}`: apiURL;
    getImages(apiURL);
    window.scrollTo({top: 0, behavior: 'smooth'});
}

const loadSearchImages = (e) => {
    // if the search input is empty, set searchTerm = null 
    if(e.target.value === "") return searchTerm = null;

    if(e.key === "Enter"){
        currentPage = 1;
        searchTerm = e.target.value;
        imagesWrapper.innerHTML = "";
        getImages(`https://api.pexels.com/v1/search?query=${searchTerm}&page=${currentPage}&per_page=${perPage}`)
    }
}

getImages(`https://api.pexels.com/v1/curated?page=${currentPage}&per_page=${perPage}`);

loadMoreBtn.addEventListener("click", loadMoreImages);
searchInput.addEventListener("keyup", loadSearchImages);
closeBtn.addEventListener("click", hideLightbox);
downloadImgBtn.addEventListener("click", (e) => downloadImg(e.target.dataset.img));