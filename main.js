import "virtual:windi.css";
import is from "is_js";

// dom elements
const input = document.querySelector("input");
const form = document.querySelector("form");
const list = document.querySelector("#links");

// list of links for testing
const urls = [
	"duckduckgo.com/",
	"https://search.brave.com",
	"https://www.firefox.com",
	"www.oneminch.dev",
	"https://onezero.medium.com/survival-of-the-richest-9ef6cddd0cc1"
];

// dom parser
let dom = new DOMParser();
let listEmpty = true;

// title sources
let titleSources = [];
// description sources
let descSources = [];
// image sources
let imgSources = [];

// if element exists, returns wanted attribute value
const getExistingAttribute = (dom, elementSelector, attr, list) => {
	if (dom.querySelector(elementSelector)) {
		list.push(dom.querySelector(elementSelector).getAttribute(attr));
	}
};

const createLinkElement = (url, title, desc, img) => {
	const link = `
		<a
			href="${url}"
			class="w-full bg-blue-gray-50 my-4 flex justify-start rounded-lg shadow-lg px-8 py-6 focus:outline-none focus:ring-2 ring-purple-600 ring-opacity-50"
			target="_blank" rel="noopener noreferrer"
			>
			<img
				class="w-12 h-12 mr-4 object-cover rounded-md"
				src="${img}"
				alt="site image" />
			<div class="text-left flex items-start justify-start flex-col">
				<h2 class="font-bold mb-2">${title}</h2>
				<p>${desc}</p>
			</div>
		</a>
	`;

	return link;
};

const getData = (url) => {
	// add https protocol to urls with none
	const urlProtocol = new RegExp(/^https?:\/\//, "i");
	if (!urlProtocol.test(url)) {
		url = `https://${url}`;
	}

	// fetch link and create link element
	fetch(`https://api.allorigins.win/get?url=${encodeURIComponent(url)}`)
		.then((response) => {
			if (response.ok) return response.json();
			throw new Error("Network response was not ok.");
		})
		.then((data) => {
			const parser = new DOMParser();
			dom = parser.parseFromString(data.contents, "text/html");

			// empty out all sources
			titleSources = [];
			descSources = [];
			imgSources = [];

			// collect title sources
			getExistingAttribute(
				dom,
				"meta[property='og:title']",
				"content",
				titleSources
			);

			if (dom.querySelector("title")) {
				titleSources.push(dom.querySelector("title").textContent);
			}

			// collect description sources
			getExistingAttribute(
				dom,
				"meta[property='og:description']",
				"content",
				descSources
			);
			getExistingAttribute(
				dom,
				"meta[name='description']",
				"content",
				descSources
			);

			// collect image sources
			getExistingAttribute(
				dom,
				"meta[property='og:image']",
				"content",
				imgSources
			);

			[
				...dom.querySelectorAll("link[rel='apple-touch-icon']"),
				...dom.querySelectorAll("link[rel='icon']")
			].forEach((el) => {
				if (el.href.startsWith(window.location.origin)) {
					let imgLink = `${url}${el.getAttribute("href")}`;
					imgSources.push(imgLink);
					return;
				}

				imgSources.push(el.href);
			});

			let title = titleSources.length > 0 ? titleSources[0] : url;
			let desc = descSources.length > 0 ? descSources[0] : "";
			let img =
				imgSources.length > 0 ? imgSources[0] : "https://fakeimg.pl/300/";

			// prepend link element to page
			let currList = list.innerHTML;
			list.innerHTML = createLinkElement(url, title, desc, img) + currList;
		})
		.catch((err) => {
			console.log(err);
			console.log("Something went wrong");
		});
};

urls.forEach((url) => getData(url));

form.addEventListener("submit", (e) => {
	e.preventDefault();
	if (is.url(input.value.trim())) getData(input.value.trim());
	input.value = "";
});
