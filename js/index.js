import Router from "./paramHashRouter.js";
import Routes from "./routes.js";

window.router = new Router(Routes, "welcome");
{/* <div class="all_comments_wrapper">
<div class="about_goods_topic">Comments!</div>
<!-- Comment template -->
{{#comments}}
<div id="comment" class="comment">
    <div class="comment_user">
        <p>User - {{name}}</p>
        <textarea readonly>{{message}}</textarea>
    </div>
</div>
{{/comments}}
</div> */}