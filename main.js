import "virtual:windi.css";
import is from "is_js";

const urls = [
	"https://www.mozilla.org/en-US/",
	"https://onezero.medium.com/survival-of-the-richest-9ef6cddd0cc1"
];

// const favicon = document.querySelector("#favicon");
const list = document.querySelector(".app");
// const title = document.querySelector("h2");
// const desc = document.querySelector("p");

const isDefined = (item) => {
	return item !== undefined && item !== null;
};

// TODO: get all favicon sources and use as fallback
// TODO: perform undefined/null check earlier on push 
// TODO: loop thru possible value sources for each component: title, desc, image
// TODO: prefer social media metadata - open graph / twitter cards
// TODO: use defined && shorter content value
// TODO: create each element dynamically
// TODO: possibly switch to alpine or petite-vue
// TODO: use input to generate preview dynamically
// TODO: preview should be wrapped in `<a>` tag

let dom = new DOMParser();

// title sources
let titleSources = [];
// description sources
let descSources = [];
// image sources
let imgSources = [];

const createLinkElement = (title, desc, img) => {
	const link = `
		<a
			class="w-9/12 bg-gray-50 mx-auto my-4 flex justify-between rounded-lg shadow-lg px-8 py-6">
			<img
				class="w-28 h-28 mr-4 object-cover rounded-md"
				src="${img}"
				alt="" />
			<div class="text-left flex items-start justify-start flex-col">
				<h2 class="font-bold mb-2">${title}</h2>
				<p>${desc}</p>
			</div>
		</a>
	`

	return link;
}

const getData = (url) => {
	fetch(`https://api.allorigins.win/get?url=${encodeURIComponent(url)}`)
		.then((response) => {
			if (response.ok) return response.json();
			throw new Error("Network response was not ok.");
		})
		.then((data) => {
			const parser = new DOMParser();
			dom = parser.parseFromString(data.contents, "text/html");

			titleSources.push(dom.querySelector("title").textContent);
			titleSources.push(dom.querySelector("meta[property='og:title']").getAttribute("content"));

			descSources.push(dom.querySelector("meta[name='description']").getAttribute("content"));
			descSources.push(dom.querySelector("meta[property='og:description']").getAttribute("content"));

			imgSources.push(dom.querySelector("meta[property='og:image']").getAttribute("content"));
			imgSources.push(dom.querySelector("meta[property='og:image']").getAttribute("content"));

			let title = isDefined(titleSources[0]) ? titleSources[0] : "";
			let desc = isDefined(descSources[0]) ? descSources[0] : "";
			let img = isDefined(imgSources[0]) ? imgSources[0] : "https://fakeimg.pl/300/";

			list.innerHTML += createLinkElement(title, desc, img)
			// favicon.src = dom
			// 	.querySelector("link[sizes='120x120']")
			// 	.getAttribute("href");
		})
		.catch((err) => {
			console.log(err);
			console.log(titleSources, descSources, isDefined(imgSources[0]));
			console.log("something went wrong");
		});
};

// getData(urls[0]);
// urls.forEach((url) => getData(url));

const input = document.querySelector("input")

input.addEventListener("keyup", (e) => {
	if (input.value && e.key == "Enter") {
		if (is.url(input.value))
			getData(input.value);
		input.value = "";
	}
})
