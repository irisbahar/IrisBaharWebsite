fetch("./data/students.json")
  .then((res) => res.json())
  .then((data) => {
    const studentsContainer = document.querySelector(".students-container");
    const pastStudentsContainer = document.querySelector(
      ".past-students-container"
    );

    data.students.forEach((student) => {
      const studentCard = document.createElement("div");
      studentCard.className = "studentCard";

      const studentImg = document.createElement("div");
      studentImg.className = "studentImg";

      const headshot = document.createElement("img");
      headshot.src = student.image || "default.jpg";
      headshot.alt = student.name;

      studentImg.appendChild(headshot);

      const studentName = document.createElement("h3");
      studentName.textContent = student.name;

      const studentProgram = document.createElement("h3");
      studentProgram.textContent = student.program;

      const graduation = document.createElement("h4");
      graduation.textContent = `Graduation: ${student.graduation}`;

      const description = document.createElement("p");
      description.textContent = student.about;

      studentCard.appendChild(studentImg);
      studentCard.appendChild(studentName);
      studentCard.appendChild(studentProgram);
      studentCard.appendChild(graduation);
      studentCard.appendChild(description);

      studentsContainer.appendChild(studentCard);
    });

    data.pastStudents.forEach((pastStudent) => {
      const pastStudentCard = document.createElement("div");
      pastStudentCard.className = "studentCard";

      // const pastStudentImg = document.createElement("div");
      // pastStudentImg.className = "studentImg";

      // const headshot = document.createElement("img");
      // headshot.src = student.image || "default.jpg";
      // headshot.alt = student.name;

      //pastStudentImg.appendChild(headshot);

      const pastStudentName = document.createElement("h3");
      pastStudentName.textContent = pastStudent.name;

      const graduation = document.createElement("h4");
      graduation.textContent = `${pastStudent.date}`;

      pastStudentCard.appendChild(pastStudentName);
      pastStudentCard.appendChild(graduation);


      let description;
      if(pastStudent?.co_advised_with) {
      description = document.createElement("p");
      description.textContent = `Co advised with : ${pastStudent?.co_advised_with}`
      pastStudentCard.appendChild(description);
      }

     // studentCard.appendChild(pastStudentImg);


      pastStudentsContainer.appendChild(pastStudentCard);
    });
  });
