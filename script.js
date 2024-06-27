
let currentSong = new Audio();
 
let songs;
let currFolder;

//  in seconds to minutes seconds  
function secondsToMinutes(seconds) {

    
    let minutes = Math.floor(seconds / 60);
    let remainingSeconds = Math.floor(seconds % 60);

    // Adding leading zeros if necessary
    let formattedMinutes = minutes < 10 ? '0' + minutes : minutes;
    let formattedSeconds = remainingSeconds < 10 ? '0' + remainingSeconds : remainingSeconds;

    return formattedMinutes + ':' + formattedSeconds;
}


// plays Music 
const playMusic = (track,p=false) => {
    currentSong.src = `/${currFolder}/` + track;
    if(!p)
    {
        currentSong.play();
        play.src = "assets/pause.svg";
    }


    
   
    
    document.querySelector(".songInfo").innerHTML = decodeURI(track);
    document.querySelector(".songTimer").innerHTML = "00:00/00:00";
}

// get all the albums 
async function dispAlbums() {
    let s = await fetch(`http://127.0.0.1:5500/songs/`)  //getting main songs folder 
    let response = await s.text();
    let div = document.createElement("div");
    div.innerHTML = response;
    let anchors = div.getElementsByTagName("a"); // getting anchor tags as some of them will contain url of folders 
    let array = Array.from(anchors);
    let cardContainer = document.querySelector(".cardContainer")
    for (let index = 0; index < array.length; index++) {
        const e = array[index];

        if (e.href.includes("/songs/")) {

            let folder = e.href.split("/").slice(-1)[0];
            let a = await fetch(`http://127.0.0.1:5500/songs/${folder}/info.json`);
            let response = await a.json();
            cardContainer.innerHTML = cardContainer.innerHTML + `<div data-folder="${folder}" class="album">
                            <img class="lofi" src="/songs/${folder}/cover.jpg" alt="cover image">
                            <h1>${response.title}</h1>
                            <p>${response.description}</p>
                            <div class="play"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24"
                                    height="24" color="#b8e986" fill="none">
                                    <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="1.5" />
                                    <path
                                        d="M15.4531 12.3948C15.3016 13.0215 14.5857 13.4644 13.1539 14.3502C11.7697 15.2064 11.0777 15.6346 10.5199 15.4625C10.2893 15.3913 10.0793 15.2562 9.90982 15.07C9.5 14.6198 9.5 13.7465 9.5 12C9.5 10.2535 9.5 9.38018 9.90982 8.92995C10.0793 8.74381 10.2893 8.60868 10.5199 8.53753C11.0777 8.36544 11.7697 8.79357 13.1539 9.64983C14.5857 10.5356 15.3016 10.9785 15.4531 11.6052C15.5156 11.8639 15.5156 12.1361 15.4531 12.3948Z"
                                        stroke="currentColor" stroke-width="1.5" stroke-linejoin="round" />
                                </svg></div>


                        </div>`
        }

    }

}


//  function to fetch songs of  a particular folder and present them in songs list   
async function getSongs(folder) {
   

    currFolder = folder;
    let s = await fetch(`http://127.0.0.1:5500/${folder}/`)


    let response = await s.text();               // parsing response to text
    let div = document.createElement("div");       // extracting list of songs from text documents
    div.innerHTML = response;
    let lis = div.getElementsByTagName("a");       //as anchor tag will contain reference of songs 



    songs = [];
    for (let index = 0; index < lis.length; index++) {
        const element = lis[index];
        if (element.href.endsWith(".mp3"))   //as other data can also be there so filtering only where refering to  as we only need .mp3
        {
            songs.push(element.href.split(`/${folder}/`)[1]);
        }

    }




    let songsDisp = document.querySelector(".songsList").getElementsByTagName("ul")[0]; //accessing dom element 
    //songDisp=<ul>
    songsDisp.innerHTML = "";

    for (const song of songs) {
        songsDisp.innerHTML = songsDisp.innerHTML + `<li> <img class="p" src="assets/music.svg" alt="music icon here">
        
         <span>${song.replaceAll("%20", " ")}</span>   <img class="p" src="assets/play.svg" alt="assets/play icon "></li>`;

        //dom manipulation i.e adding html code dynamically  

    }

    //  Step 2:-event listner on songs list


    Array.from(document.querySelector(".songsList").getElementsByTagName("li")).forEach(e => {
        e.addEventListener("click", element => {
            console.log(e.getElementsByTagName("span")[0].innerHTML);
            playMusic(e.getElementsByTagName("span")[0].innerHTML);

        })


    })


    return songs;

}







// Main function
async function main() {



    await getSongs(`songs/ncs`); 
    playMusic(songs[0],true);                                                //loading default folder

    await dispAlbums();                                                      //display all the albums 

    


    //n Step 3:-play/pause event on svg to handle click
    play.addEventListener("click", () => {
        if (currentSong.paused) {
            currentSong.play()
            play.src = "assets/pause.svg";
        }
        else {
            currentSong.pause()
            play.src = "assets/play.svg";
        }
    })


    //step 4:- update time of song+ update position of circle of seekbar as song proceeds 
    currentSong.addEventListener("timeupdate", () => {
        //console.log(currentSong.currentTime,currentSong.duration);
        document.querySelector(".songTimer").innerHTML = `${secondsToMinutes(currentSong.currentTime)}/ ${secondsToMinutes(currentSong.duration)}`


        document.querySelector(".circle").style.left = (currentSong.currentTime / currentSong.duration) * 100 + "%";

    })


    //step 5:- update circle of seekbar when triggered by user spotify allowed this feature only in their advanced versions


    document.querySelector(".seakbar").addEventListener("click", (e) => {
        let percent = (e.offsetX / e.target.getBoundingClientRect().width) * 100;
        document.querySelector(".circle").style.left = percent + "%";


        // moving song with seakbar's circle
        currentSong.currentTime = ((currentSong.duration) * percent) / 100;
    })

    //{e.target.getBoundingClientRect().width} gives us only width of our element i.e seakbar in our case 
    //{e.offsetX} returns offset X of our seakbar where event e i.e click occurs 



    previous.addEventListener("click", () => {
        currentSong.pause();
        let index = songs.indexOf(currentSong.src.split("/").slice(-1)[0]);
        if (index > 0) {


            playMusic(songs[index - 1]);
        }
        else {
            playMusic(songs[songs.length - 1]);
        }
         

    })



    next.addEventListener("click", () => {
        currentSong.pause();
        let index = songs.indexOf(currentSong.src.split("/").slice(-1)[0]);
        //console.log(index);//without [0], it will return an array with one element, which is the file name. If you want to directly get the file name as a string instead of an array containing the file name, you would need to add [0] at the end to access that single element.
        if (index < (songs.length - 1)) {
            playMusic(songs[index + 1]);
            //console.log("hey");
        }
        else {
            playMusic(songs[0]);
        }
    })




    document.querySelector(".volumee").getElementsByTagName("input")[0].addEventListener("change", (e) => {
        currentSong.volume = parseInt(e.target.value) / 100;
        //e.target.value gives value where event e occured on target element 
        if(currentSong.volume>0)
        {
            document.querySelector(".volumee>img").src ="assets/volumeup.svg";
        }
        else
        {
            document.querySelector(".volumee>img").src = "assets/mute.svg";
        }
    })


//adding event for loading other album
    Array.from(document.getElementsByClassName("album")).forEach(e => {
        e.addEventListener("click", async item => {
            songs = await getSongs(`songs/${item.currentTarget.dataset.folder}`);

        })
    })


 

    volume.addEventListener("click", e => {
        if (e.target.src.includes("assets/volumeup.svg")  ) {

            e.target.src = "assets/mute.svg";
            currentSong.volume = 0;
            volRange.value = 0;
        }
        else {
            e.target.src = "assets/volumeup.svg";
            currentSong.volume = 0.2;
            volRange.value = 30;
        }
    })


    //event for menu open and close

    document.querySelector(".hamu").addEventListener("click", () => {
        document.querySelector(".left").style.left = "0";


    })



    document.querySelector(".cross").addEventListener("click", () => {
        document.querySelector(".left").style.left = "-100%";


    })

    // events for making volume range invisible and appear

    document.querySelector(".volumee").addEventListener("mouseenter", () => {

        document.getElementById("volRange").style.display = "inline";
    })
    document.querySelector(".volumee").addEventListener("mouseleave", () => {

        document.getElementById("volRange").style.display = "none";
    })
}


// document.querySelector(".playlist") =

main()


