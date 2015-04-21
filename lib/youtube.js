module.exports = function ($) {
  // Wrap YouTube videos in an element so they're easier to style
  $('iframe[src*="youtube.com"]').each(function (i, elem) {
    $(this).before("<div class='youtube-video'>" + $(this).toString() + '</div>')
    $(this).remove()
  })

  return $
}
