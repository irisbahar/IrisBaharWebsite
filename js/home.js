fetch("./data/home.json")
  .then((res) => res.json())
  .then((data) => {
    document.getElementById("name").textContent = data.name;
    document.getElementById("title").textContent = data.title;
    document.getElementById("desc").textContent = data.overview;
  });
