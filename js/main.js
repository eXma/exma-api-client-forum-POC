/**
 * Created with IntelliJ IDEA.
 * User: jan
 * Date: 09.01.13
 * Time: 23:54
 * To change this template use File | Settings | File Templates.
 */

window.Topic = Backbone.Model.extend({
    defaults: {title: "(...)"},

    initialize: function () {
        this.posts = new PostCollection;
        this.posts.topicId = this.id;
    }
});

window.Post = Backbone.Model.extend();

window.TopicCollection = Backbone.Collection.extend({
    model: Topic,
    page: 0,
    url: function () {
        return API_PATH + "topics?limit=15&offset=" + (this.page * 15);
    }
});

window.PostCollection = Backbone.Collection.extend({
    model: Post,

    url: function () {
        return API_PATH + "topics/" + this.topicId + "/posts";
    }
});

window.PostList = Backbone.View.extend({
    template: _.template($('#postlist').html()),

    initialize: function () {
        this.model.bind("reset", this.render, this);
    },

    render: function (eventName) {
        _.each(this.model.models, function (post) {
            this.$el.append(this.template(post.toJSON()));
        }, this);
        this.$el.listview('refresh');
        return this;
    }
});

window.HomeView = Backbone.View.extend({
    template: _.template($('#home').html()),

    initialize: function () {
    },

    render: function (eventName) {
        $(this.el).html(this.template);

        this.topicListCollection = new TopicCollection();
        new TopicList({el: $(this.el).find("ul").first(), model: this.topicListCollection});
        this.topicListCollection.fetch();

        return this;
    }
});

window.TopicList = Backbone.View.extend({

    template: _.template($('#topiclist').html()),
    isLoading: true,

    initialize: function () {
        this.model.bind("reset", this.render, this);
        _.bindAll(this, 'checkScroll');
        // bind to window
        $(window).scroll(this.checkScroll);
    },

    render: function (eventName) {
        _.each(this.model.models, function (topic) {
            this.$el.append(this.template(topic.toJSON()));
        }, this);
        this.$el.listview('refresh');
        this.isLoading = false;
        return this;
    },
    checkScroll: function () {
        var triggerPoint = 150; // 100px from the bottom
        $window = $(window);
        if (!this.isLoading && $window.scrollTop() + $window.height() + triggerPoint > $(document).height()) {
            this.isLoading = true;
            this.model.page += 1;
            this.model.fetch();
        }
    }
});

window.TopicView = Backbone.View.extend({

    template: _.template($('#topic').html()),

    initialize: function () {
        this.model.bind("change", this.updateTitle, this);
    },

    updateTitle: function (e) {
        $(this.$el).find("h1").html(this.model.get("title"));
    },

    render: function (eventName) {
        $(this.el).html(this.template(this.model.toJSON()));

        this.postListCollection = this.model.posts;
        new PostList({el: $(this.el).find("ul").first(), model: this.postListCollection});
        this.postListCollection.fetch();

        return this;
    }
});


var AppRouter = Backbone.Router.extend({

    routes: {
        "": "home",
        "topic/:id": "topic"
    },

    initialize: function () {
        // Handle back button throughout the application
        $('.back').live('click', function (event) {
            window.history.back();
            return false;
        });
        this.firstPage = true;
    },

    home: function () {
        console.log('#home');
        this.changePage(new HomeView());
    },

    topic: function (tid) {
        console.log('#topic');
        this.topicModel = new Topic({id: tid, tid: tid});
        this.changePage(new TopicView({model: this.topicModel}));
        this.topicModel.fetch();
    },


    changePage: function (page) {
        $(page.el).attr('data-role', 'page');
        page.render();
        $('body').append($(page.el));
        var transition = $.mobile.defaultPageTransition;
        // We don't want to slide the first page
        if (this.firstPage) {
            transition = 'none';
            this.firstPage = false;
        }
        $.mobile.changePage($(page.el), {changeHash: false, transition: transition});
    }

});


$(document).ready(function () {
    console.log('document ready');
    app = new AppRouter();
    Backbone.history.start();
});