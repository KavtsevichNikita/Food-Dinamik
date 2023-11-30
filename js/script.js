// Get Google auth data and decode them

function decodeJwtResponse(credential) {
  const [header, payload, signature] = credential.split(".");
  const decodedPayload = JSON.parse(atob(payload));

  return decodedPayload;
}

// Sign In

function handleCredentialResponse(response) {
  const responsePayload = decodeJwtResponse(response.credential);

  localStorage.setItem("isLoggedIn", "true");
  localStorage.setItem("userId", responsePayload.sub);
  localStorage.setItem("userName", responsePayload.given_name);
  localStorage.setItem("userEmail", responsePayload.email);

  updateLoginStatus();
}

// Sign Out user

function signOut() {
  localStorage.removeItem("isLoggedIn");
  localStorage.removeItem("userId");
  localStorage.removeItem("userName");
  localStorage.removeItem("userEmail");

  updateLoginStatus();
}

// Login Status function

function updateLoginStatus() {
  const isLoggedIn = localStorage.getItem("isLoggedIn") === "true";

  const loginButton = document.getElementById("loginButton");
  const logoutButton = document.getElementById("logoutButton");

  const usernameDisplay = document.getElementById("usernameDisplay");
  const userName = localStorage.getItem("userName");
  const userEmail = localStorage.getItem("userEmail");

  if (isLoggedIn) {
    closeMenu();
    if (loginButton) loginButton.style.display = "none";
    if (logoutButton) logoutButton.style.display = "block";
    if (usernameDisplay) {
      usernameDisplay.textContent = `Hi, ${userName}`;
      usernameDisplay.style.display = "block";
      document.getElementById("add-author").value = userName;
      document.getElementById("name").value = userName;
      document.getElementById("email").value = userEmail;
    }
  } else {
    if (loginButton) loginButton.style.display = "block";
    if (logoutButton) logoutButton.style.display = "none";
    if (usernameDisplay) {
      usernameDisplay.style.display = "none";
    }

    if (document.getElementById("name") && document.getElementById("email")) {
      document.getElementById("name").value = "";
      document.getElementById("email").value = "";
      document.getElementById("add-author").value = "";
    }
  }
}

// Edit

function editButtonClick(opinionId) {
  window.location.href = `#editOpinion/${opinionId}`;
}

// Back

function backButtonClick() {
  window.history.back();
}

// Pleasure page

function pleasurePage() {
  var svgLink = document.querySelector("#svg-link");

  if (svgLink) {
    activateLink(svgLink, 1);
    window.location.hash = "#pleasure";
  }
}

// Delete function

function deleteOpinion(uniqueId) {
  var opinionCardId = uniqueId;

  var opinionElement = document.querySelector(
    `#artOpinions[data-name="${uniqueId}"]`
  );

  if (opinionElement) {
    opinionElement.parentNode.removeChild(opinionElement);

    var formDataArray =
      JSON.parse(localStorage.getItem("myTreesComments")) || [];

    var opinionIndex = formDataArray.findIndex(function (opinion) {
      return opinion.id.toString() === uniqueId.toString();
    });

    if (opinionIndex !== -1) {
      formDataArray.splice(opinionIndex, 1);

      localStorage.setItem("myTreesComments", JSON.stringify(formDataArray));
    } else {
      console.log("Opinion not found in localStorage:", uniqueId);
    }
  } else {
    console.log("Element not found with ID:", opinionCardId);
  }

  removeItemFromLocalStorage(uniqueId);
}

// Remove from localStorage

function removeItemFromLocalStorage(uniqueId) {
  var localStorageItems = Object.keys(localStorage);

  localStorageItems.forEach(function (key) {
    if (key.endsWith(uniqueId)) {
      localStorage.removeItem(key);
    }
  });
}

// Filter by rating

function filterOpinions(category) {
  var opinions = document.querySelectorAll(".cart_of_review");

  opinions.forEach(function (opinion) {
    var dataCategory = opinion.getAttribute("data-category");

    if (category === "All" || category === dataCategory) {
      opinion.style.display = "block";
    } else {
      opinion.style.display = "none";
    }
  });
}

// Search by name

function searchOpinions() {
  var searchInput = document.getElementById("searchBar").value.toLowerCase();
  var opinions = document.querySelectorAll(".cart_of_review");

  opinions.forEach(function (opinion) {
    var opinionName = opinion.getAttribute("data-search").toLowerCase();

    if (opinionName.includes(searchInput)) {
      opinion.style.display = "block";
    } else {
      opinion.style.display = "none";
    }
  });
}

// Close burger menu

function closeMenu(link, index) {
  document.getElementById("menu__toggle").checked = false;

  if (link && link.classList) {
    var burgerLinks = document.querySelectorAll(".menu_link_burger");
    burgerLinks.forEach(function (item, i) {
      item.classList.remove("active_burger");
      if (i === index) {
        item.classList.add("active_burger");
      }
    });

    var normalLinks = document.querySelectorAll(".menu_link");
    normalLinks.forEach(function (item) {
      item.classList.remove("active");
    });
    normalLinks[index].classList.add("active");
  }
}

// Change header active page color

function activateLink(link, index) {
  if (link && link.classList) {
    var normalLinks = document.querySelectorAll(".menu_link");
    normalLinks.forEach(function (item, i) {
      item.classList.remove("active");
      if (i === index) {
        item.classList.add("active");
      }
    });

    var burgerLinks = document.querySelectorAll(".menu_link_burger");
    burgerLinks.forEach(function (item) {
      item.classList.remove("active_burger");
    });
    burgerLinks[index].classList.add("active_burger");
  }
}

function changeLikedStatus(icon) {
  icon.classList.toggle('fa-heart-o');
  icon.classList.toggle('fa-heart');

  if (icon.classList.contains('fa-heart-o')) {
      document.querySelector('.fa-heart').style.display = 'none';
  } else {
      document.querySelector('.fa-heart').style.display = 'inline-block';
  }
}

function handleSVGClick() {
  var svgLink = document.querySelector("#svg-link");

  if (svgLink) {
    activateLink(svgLink, 0);
    window.location.hash = `#welcome`;
  }
}

// Check Login

document.addEventListener("DOMContentLoaded", function () {
  updateLoginStatus();
});
