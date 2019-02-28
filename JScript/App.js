$(document).ready(function() {
    $('#myCanvas').annotate({
        color: 'red',
        linewidth: 4,
        bootstrap: true,
        images: ['https://dl.dropboxusercontent.com/s/32e9lwck01bd44f/Koala.jpg']
    });

    $(".export-image").click();
});