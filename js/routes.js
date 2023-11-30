import Mustache from "./mustache.js";
import addOpinion from "./addOpinion.js";
import articleFormsHandler from "./articleFormsHandler.js";

const apiKey = "1JU1eeLRTR-iImZCjotYD4d9C72tDXrdCquPNP51uZw";
const query = "Food";
const unsplashQuery = "Burgers";
const unsplash_urlBase = `https://api.unsplash.com/photos/random?query=${unsplashQuery}&client_id=${apiKey}`;
const urlBase = "https://wt.kpi.fei.tuke.sk/api";
const articlesPerPage = 4;
const commentsPerPage = 1;

export default [
  {
    hash: "welcome",
    target: "router-view",
    getTemplate: (targetElm) =>
      (document.getElementById(targetElm).innerHTML =
        document.getElementById("template-welcome").innerText),
  },
  {
    hash: "pleasure",
    target: "router-view",
    getTemplate: fetchAndDisplayUnsplashImages,
  },
  {
    hash: "opinions",
    target: "router-view",
    getTemplate: opinionsHTML,
  },
  {
    hash: "addOpinion",
    target: "router-view",
    getTemplate: (targetElm) => {
      document.getElementById(targetElm).innerHTML = document.getElementById(
        "template-addOpinion"
      ).innerHTML;
      document.getElementById("name").value = localStorage.getItem("userName");
      document.getElementById("email").value =
        localStorage.getItem("userEmail");
      document.getElementById("contact-form").onsubmit = addOpinion;
    },
  },
  {
    hash: "opinion",
    target: "router-view",
    getTemplate: (targetElm, opinionId) => {
      opinionDetails(targetElm, opinionId);
      document.getElementById("comment-name").value =
        localStorage.getItem("userName");
      document.getElementById("comment_form").onsubmit = function (event) {
        event.preventDefault();
        addComment(opinionId);
      };
    },
  },
  {
    hash: "editOpinion",
    target: "router-view",
    getTemplate: editOpinion,
  },
  {
    hash: "article",
    target: "router-view",
    getTemplate: fetchAndDisplayArticleDetail
  },
  {
    hash: "articles",
    target: "router-view",
    getTemplate: fetchAndDisplayArticles,
  },
  {
    hash: "artEdit",
    target: "router-view",
    getTemplate: editArticle,
  },
  {
    hash: "addArticle",
    target: "router-view",
    getTemplate: (targetElm) => {
      document.getElementById(targetElm).innerHTML = document.getElementById(
        "template-addArticle"
      ).innerHTML;
      document.getElementById("add-author").value =
        localStorage.getItem("userName");
      document.getElementById("addArticleForm").onsubmit = addOpinionArticle;
    },
  },
];


// Functions

function calculateMaxPage(opinionsPerPage) {
  let formDataArray = localStorage.myTreesComments;
  let opinions = [];

  if (formDataArray) {
    opinions = JSON.parse(formDataArray);
  }

  const maxPage =
    opinions.length === 0 ? 1 : Math.ceil(opinions.length / opinionsPerPage);
  return maxPage;
}

function opinionsHTML(targetElm, currentPage) {
  currentPage = parseInt(currentPage);

  const opinionsPerPage = 3;
  const totalPage = calculateMaxPage(opinionsPerPage);

  let formDataArray = localStorage.myTreesComments;
  let opinions = [];

  if (formDataArray) {
    opinions = JSON.parse(formDataArray);

    opinions.forEach((opinion) => {
      opinion.created = new Date().toLocaleDateString();
    });
  }

  const renderData = {
    formDataArray: [],
    currPage: currentPage,
    pageCount: totalPage,
  };

  if (currentPage > 1) {
    renderData.prevPage = currentPage - 1;
  }

  if (currentPage < totalPage) {
    renderData.nextPage = currentPage + 1;
  }

  if (currentPage >= 1 && currentPage <= totalPage) {
    const startIndex = (currentPage - 1) * opinionsPerPage;
    const endIndex = startIndex + opinionsPerPage;
    renderData.formDataArray = opinions.slice(startIndex, endIndex);
  }

  updateNavigationLinks(totalPage);
  document.getElementById(targetElm).innerHTML = Mustache.render(
    document.getElementById("template-opinions").innerHTML,
    renderData
  );

  const detailsButtons = document.querySelectorAll(".view_details");
  detailsButtons.forEach((button) => {
    button.addEventListener("click", function () {
      const opinionId = button.getAttribute("data-opinion-id");
      window.location.href = `#opinion/${opinionId}`;
    });
  });
}

function updateNavigationLinks(maxPage) {
  const opinionsLink = document.querySelector(
    "#menuIts a[href='#opinions/1/1']"
  );
  if (opinionsLink) {
    opinionsLink.href = `#opinions/1/${maxPage}`;
  }
}

async function fetchAndDisplayUnsplashImages(targetElm) {
  const xml = new XMLHttpRequest();

  xml.onreadystatechange = function () {
    if (xml.readyState === XMLHttpRequest.DONE) {
      if (xml.status === 200) {
        const responseJSON = JSON.parse(xml.responseText);
        const template = document.getElementById("template-pleasure").innerHTML;

        document.getElementById(targetElm).innerHTML = Mustache.render(
          template,
          responseJSON
        );

        console.log(responseJSON);
      } else {
        console.error(`Server answered with ${xml.status}: ${xml.statusText}.`);
      }
    }
  };

  xml.open("GET", unsplash_urlBase, true);
  xml.send();
}

function editOpinion(targetElm, opinionId) {
  let formDataArray = localStorage.myTreesComments;
  let opinions = [];

  if (formDataArray) {
    opinions = JSON.parse(formDataArray);
  }

  const opinion = opinions.find(
    (op) => decodeURIComponent(op.id) === decodeURIComponent(opinionId)
  );

  if (opinion) {
    document.getElementById(targetElm).innerHTML = Mustache.render(
      document.getElementById("template-editOpinion").innerHTML,
      opinion
    );

    const editForm = document.getElementById("edit-form");

    const foodRatingElements = editForm.querySelectorAll(
      "[name='edit-foodRating']"
    );
    for (const radio of foodRatingElements) {
      if (radio.value === opinion.foodRatingValue) {
        radio.checked = true;
        break;
      }
    }

    editForm.querySelector('[name="edit-name"]').value = opinion.name;
    editForm.querySelector('[name="edit-email"]').value = opinion.email;
    editForm.querySelector('[name="edit-url"]').value = opinion.url;
    editForm.querySelector('[name="edit-keywords"]').value = opinion.keywords;
    editForm.querySelector('[name="edit-pastries"]').checked = opinion.pastries;
    editForm.querySelector('[name="edit-message"]').value = opinion.message;

    editForm.addEventListener("submit", function (event) {
      event.preventDefault();

      let foodRatingValue;
      for (const radio of foodRatingElements) {
        if (radio.checked) {
          foodRatingValue = radio.value;
          break;
        }
      }

      const editedOpinion = {
        id: opinion.id,
        name: editForm.querySelector('[name="edit-name"]').value,
        email: editForm.querySelector('[name="edit-email"]').value,
        url: editForm.querySelector('[name="edit-url"]').value,
        keywords: editForm.querySelector('[name="edit-keywords"]').value,
        foodRatingValue: foodRatingValue,
        pastries: editForm.querySelector('[name="edit-pastries"]').checked,
        message: editForm.querySelector('[name="edit-message"]').value,
        created: opinion.created,
        comments: opinion.comments,
      };
      const index = opinions.findIndex(
        (op) => decodeURIComponent(op.id) === decodeURIComponent(opinionId)
      );

      opinions[index] = editedOpinion;

      localStorage.myTreesComments = JSON.stringify(opinions);

      window.location.href = `#opinion/${editedOpinion.id}`;
    });
  } else {
    document.getElementById(targetElm).innerHTML = "Opinion not found.";
  }
}

function opinionDetails(targetElm, opinionId) {
  let formDataArray = localStorage.myTreesComments;
  let opinions = [];

  if (formDataArray) {
    opinions = JSON.parse(formDataArray);
  }

  const opinion = opinions.find(
    (op) => decodeURIComponent(op.id) === decodeURIComponent(opinionId)
  );

  if (opinion) {
    const targetElement = document.getElementById(targetElm);
    const template = document.getElementById("template-opinion").innerHTML;
    const renderedTemplate = Mustache.render(template, opinion);

    targetElement.innerHTML = renderedTemplate;
  } else {
    document.getElementById(targetElm).innerHTML = "Opinion not found.";
  }
}

function addComment(opinionId) {
  const formDataArray = localStorage.myTreesComments || "[]";
  let opinions = JSON.parse(formDataArray);

  const nameInput = document.getElementById("comment-name");
  const messageInput = document.getElementById("comment-message");

  const opinionIndex = opinions.findIndex(
    (op) => decodeURIComponent(op.id) === decodeURIComponent(opinionId)
  );

  const newComment = {
    name: nameInput.value,
    message: messageInput.value,
    created: new Date().toLocaleDateString(),
  };

  if (opinionIndex !== -1) {
    opinions[opinionIndex].comments.push(newComment);
  } else {
    opinions.push({ name: opinionId, comments: [newComment] });
  }

  const commentWrapper = document.querySelector(".all_comments_wrapper");

  const commentTemplate = `
    <div class="comment">
      <div class="comment_user">
        <p>User - ${newComment.name}</p>
        <textarea readonly>${newComment.message}</textarea>
      </div>
    </div>
  `;

  commentWrapper.insertAdjacentHTML("beforeend", commentTemplate);

  localStorage.myTreesComments = JSON.stringify(opinions);

  if (!localStorage.getItem("userName")) {
    nameInput.value = "";
  }

  messageInput.value = "";
}


///  Articles functions

async function fetchAndDisplayArticles(
  targetElm,
  offsetFromHash,
  totalCountFromHash
) {
  const offset = Number(offsetFromHash);
  const totalCount = Number(totalCountFromHash);

  let urlQuery = "";

  if (offset && totalCount) {
    urlQuery=`?offset=${offset}&max=${articlesPerPage}&tag=${query}`;
    // urlQuery = `?offset=${offset}&max=${articlesPerPage}`;
  } else {
    urlQuery=`?max=${articlesPerPage}&tag=${query}`;
    // urlQuery = `?max=${articlesPerPage}`;
  }

  const url = `${urlBase}/article${urlQuery}`;

  function reqListener() {
    if (this.status == 200) {
      const responseJSON = JSON.parse(this.responseText);


      if (offset > 1) {
        responseJSON.meta.prevPage = offset - 1;
      }

      if (offset < totalCount) {
        responseJSON.meta.nextPage = offset + 1;
      }

      addArtDetailLink2ResponseJson(responseJSON);
      document.getElementById(targetElm).innerHTML = Mustache.render(
        document.getElementById("template-articles").innerHTML,
        responseJSON
      );
    } else {
      const errMsgObj = { errMessage: this.responseText };
      document.getElementById(targetElm).innerHTML = Mustache.render(
        document.getElementById("template-articles-error").innerHTML,
        errMsgObj
      );
    }
  }

  console.log(url);
  var ajax = new XMLHttpRequest();
  ajax.addEventListener("load", reqListener);
  ajax.open("GET", url, true);
  ajax.send();
}

function fetchAndDisplayArticleDetail(
  targetElm,
  artIdFromHash,
  offsetFromHash,
  totalCountFromHash
) {
  fetchAndProcessArticle(...arguments, false);
}

function editArticle(
  targetElm,
  artIdFromHash,
  offsetFromHash,
  totalCountFromHash
) {
  fetchAndProcessArticle(...arguments, true);
}

function addArtDetailLink2ResponseJson(responseJSON) {
  responseJSON.articles = responseJSON.articles.map((article) => ({
    ...article,
    detailLink: `#article/${article.id}/${responseJSON.meta.offset}/${responseJSON.meta.totalCount}`,
  }));
}

function addOpinionArticle(event) {
  event.preventDefault();
  const author = document.getElementById("add-author").value;
  const title = document.getElementById("add-title").value;
  const imageLink = document.getElementById("add-imageLink").value;
  const tags = document.getElementById("add-tags").value;
  const content = document.getElementById("add-content").value;

  const opinionData = {
    title,
    content,
    imageLink,
    author,
    tags,
  };

  fetch(`${urlBase}/article`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(opinionData),
  })
    .then((response) => response.json())
    .then((data) => {
      console.log("Success:", data);

      var sendButton = document.querySelector("#send_article");

      if (sendButton) {
          activateLink(sendButton, 3);
          window.location.hash = `#articles/1/500`;
      }
    })
    .catch((error) => {
      console.error("Error:", error);
    });
}

async function deleteArticle(artId) {
  console.log("Deleting article:", artId);

  const deleteUrl = `${urlBase}/article/${artId}`;

  try {
    const response = await fetch(deleteUrl, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
      },
    });

    console.log("Fetch completed");

    if (response.ok) {
      console.log("Article deleted successfully");
      window.location.hash = "#articles/1/10";
    } else {
      console.error("Error deleting article");
    }
  } catch (error) {
    console.error("Error:", error);
  }
}

async function fetchAndProcessArticle(
  targetElm,
  artIdFromHash,
  offsetFromHash,
  totalCountFromHash,
  forEdit
) {
  const url = `${urlBase}/article/${artIdFromHash}`;

  function reqListener() {
    if (this.status == 200) {
      const responseJSON = JSON.parse(this.responseText);
      responseJSON.data = [];

      if (forEdit) {

        responseJSON.formTitle = "Article Edit";
        responseJSON.submitBtTitle = "Save article";
        responseJSON.backLink = `#article/${artIdFromHash}/${offsetFromHash}/${totalCountFromHash}`;

        document.getElementById(targetElm).innerHTML = Mustache.render(
          document.getElementById("template-article-form").innerHTML,
          responseJSON
        );
        if (!window.artFrmHandler) {
          window.artFrmHandler = new articleFormsHandler(
            "https://wt.kpi.fei.tuke.sk/api"
          );
        }
        window.artFrmHandler.assignFormAndArticle(
          "articleForm",
          "hiddenElm",
          artIdFromHash,
          offsetFromHash,
          totalCountFromHash
        );
      } else {

        getComments(artIdFromHash, responseJSON, function (updatedResponse) {
          updatedResponse.backLink = `#articles/${offsetFromHash}/${totalCountFromHash}`;
          updatedResponse.editLink = `#artEdit/${updatedResponse.id}/${offsetFromHash}/${totalCountFromHash}`;
          updatedResponse.deleteLink = `#artDelete/${updatedResponse.id}/${offsetFromHash}/${totalCountFromHash}`;

          document.getElementById(targetElm).innerHTML = Mustache.render(
            document.getElementById("template-article").innerHTML,
            updatedResponse
          );

          // const commentForm = document.getElementById("comentar");
          // commentForm.addEventListener("submit", async function (event) {
          //   event.preventDefault();
          //   addArticleComment(updatedResponse.id);
          // });
          
          // document.getElementById("comentar").addEventListener("submit", async function (event) {
          //   event.preventDefault();
          //   await addArticleComment(artIdFromHash);
            
          //   await getComments(artIdFromHash, responseJSON, callback);
          // });

          const deleteLink = document.getElementById("deleteLink");
          deleteLink.addEventListener("click", function () {
            deleteArticle(updatedResponse.id, offsetFromHash, totalCountFromHash);
          });
        });
      }
    } else {
      const errMsgObj = { errMessage: this.responseText };
      document.getElementById(targetElm).innerHTML = Mustache.render(
        document.getElementById("template-articles-error").innerHTML,
        errMsgObj
      );
    }
  }

  var ajax = new XMLHttpRequest();
  ajax.addEventListener("load", reqListener);
  ajax.open("GET", url, true);
  ajax.send();
}

async function addArticleComment(artIdFromHash, pagination) {
  try {
    const nameInput = document.getElementById("article-comment-name").value;
    const messageInput = document.getElementById("article-comment-message").value;

    const offset = pagination.offset
    const max = pagination.max
    const totalCount = pagination.totalCount


    // if (offset > 1) {
    //   pagination.prevPage = offset - 1;
    // }

    // if (offset < totalCount) {
    //   pagination.nextPage = offset + 1;
    // }

    const newComment = {
      text: messageInput,
      author: nameInput,
      created: new Date().toLocaleDateString(),
    };

      // const offset = Number(offsetFromHash);

    const commentUrl = `${urlBase}/article/${artIdFromHash}/comment?offset=${offset}&max=${commentsPerPage}`;

    const response = await fetch(commentUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(newComment),
    });

    if (response.ok) {
      console.log("Comment added successfully");

      const nextPageOffset = offset + commentsPerPage;
      pagination.offset = nextPageOffset;

      if (nextPageOffset < totalCount) {
        pagination.nextPage = nextPageOffset;
      } else {
        pagination.nextPage = null; // No more pages
      }

      const prevPageOffset = offset - commentsPerPage;
      if (prevPageOffset >= 0) {
        pagination.prevPage = prevPageOffset;
      } else {
        pagination.prevPage = null; // No previous page
      }

      console.log(pagination)

      document.getElementById(targetElm).innerHTML = Mustache.render(
        document.getElementById("template-article").innerHTML,
        pagination
      );

    } else {
      console.error("Failed to add comment:", response.statusText);
    }
  } catch (error) {
    console.error("Error:", error);
  }
}

async function getComments(artIdFromHash, responseJSON, callback) {
  const commentUrl = `${urlBase}/article/${artIdFromHash}/comment`;

  try {
    const response = await fetch(commentUrl);

    if (response.ok) {
      const comments = await response.json();
      responseJSON.data = comments.comments;
      callback(responseJSON);
x
      const commentForm = document.getElementById("comentar");
      commentForm.addEventListener("submit", async function (event) {
        event.preventDefault();
        await addArticleComment(artIdFromHash, comments.meta);
        await getComments(artIdFromHash, responseJSON, callback);
      });
    } else {
      console.error("Failed to fetch comments:", response.statusText);
    }
  } catch (error) {
    console.error("Error:", error);
  }
}


