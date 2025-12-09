fetch("./data/home.json")
  .then((res) => res.json())
  .then((data) => {
    document.getElementById("name").textContent = data.name;
    document.getElementById("title").textContent = data.title;
    document.getElementById("desc").textContent = data.overview;

    // const postsContainer = document.getElementById("postsContainer");

    // data.posts.forEach((post) => {
    //   const card = document.createElement("div");
    //   card.className = "post-card";

    //   const link = document.createElement("a");
    //   link.href = post.link;
    //   link.target = "_blank";
    //   link.className = "post-link";

    //   const header = document.createElement("div");
    //   header.className = "post-header";

    //   const headerImg = document.createElement("div");
    //   headerImg.className = "headerImg";

    //   const headshot = document.createElement("img");
    //   headshot.src = "./headshot.jpeg";

    //   const headerNameTitle = document.createElement("div");
    //   headerNameTitle.className = "headerNameTitle";

    //   const name = document.createElement("h4");
    //   name.textContent = data.name;

    //   headerNameTitle.appendChild(name);

    //   const title = document.createElement("h5");
    //   title.textContent = data.title;

    //   headerNameTitle.appendChild(title);

    //   headerImg.appendChild(headshot);

    //   header.appendChild(headerImg);
    //   header.appendChild(headerNameTitle);

    //   const img = document.createElement("img");
    //   img.src = post.image;
    //   img.alt = post.desc;

    //   const desc = document.createElement("p");
    //   desc.textContent = post.desc;

    //   card.appendChild(header);
    //   card.appendChild(img);
    //   card.appendChild(desc);

    //   link.appendChild(card);

    //   postsContainer.appendChild(link);
    // });
  });
