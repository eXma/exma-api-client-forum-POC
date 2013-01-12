/**
 * Created with IntelliJ IDEA.
 * User: jan
 * Date: 10.01.13
 * Time: 00:11
 * To change this template use File | Settings | File Templates.
 */

$(document).bind("mobileinit", function () {
    $.mobile.ajaxEnabled = false;
    $.mobile.linkBindingEnabled = false;
    $.mobile.hashListeningEnabled = false;
    $.mobile.pushStateEnabled = false;

    // Remove page from DOM when it's being replaced
    $('div[data-role="page"]').live('pagehide', function (event, ui) {
        $(event.currentTarget).remove();
    });
});