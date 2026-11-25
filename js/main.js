(function ($) {
    "use strict";

    // 1. Spinner Removal (Guarded)
    var hideSpinner = function () {
        setTimeout(function () {
            var $spinner = $('#spinner');
            if ($spinner.length > 0) {
                $spinner.removeClass('show');
            }
        }, 1);
    };
    hideSpinner();

    // 2. Compact Sticky Header State (Does not mutate container max-width)
    $(window).on('scroll', function () {
        var scrollTop = $(this).scrollTop();
        var $header = $('header.fixed-top');
        if ($header.length > 0) {
            if (scrollTop > 40) {
                $header.addClass('nav-scrolled-3d');
            } else {
                $header.removeClass('nav-scrolled-3d');
            }
        }

        // Back-to-top button visibility
        var $backToTop = $('.back-to-top');
        if ($backToTop.length > 0) {
            if (scrollTop > 300) {
                $backToTop.fadeIn('fast');
            } else {
                $backToTop.fadeOut('fast');
            }
        }
    });

    // 3. Progress Bars (Guarded check for waypoint plugin)
    if ($.fn && typeof $.fn.waypoint === 'function' && $('.progress').length > 0) {
        $('.progress').waypoint(function () {
            $('.progress-bar').each(function () {
                $(this).css("width", $(this).attr("aria-valuenow") + '%');
            });
        }, { offset: '80%' });
    }

    // 4. Verified Impact Counter-Up (Guarded check for counterUp plugin & reduced motion)
    var prefersReducedMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (!prefersReducedMotion && $.fn && typeof $.fn.counterUp === 'function' && $('[data-toggle="counter-up"]').length > 0) {
        $('[data-toggle="counter-up"]').counterUp({
            delay: 5,
            time: 1400
        });
    }

    // 5. Event Carousel (Guarded check for owlCarousel plugin)
    if ($.fn && typeof $.fn.owlCarousel === 'function' && $(".event-carousel").length > 0) {
        $(".event-carousel").owlCarousel({
            autoplay: !prefersReducedMotion,
            smartSpeed: 800,
            center: false,
            dots: false,
            loop: true,
            margin: 25,
            nav: true,
            navText: [
                '<i class="bi bi-arrow-left" aria-hidden="true"></i><span class="visually-hidden">Previous</span>',
                '<i class="bi bi-arrow-right" aria-hidden="true"></i><span class="visually-hidden">Next</span>'
            ],
            responsiveClass: true,
            responsive: {
                0: { items: 1 },
                768: { items: 1 },
                992: { items: 2 },
                1200: { items: 3 }
            }
        });
    }

    // 6. Accessible Back to Top Click Handler
    $(document).on('click', '.back-to-top', function (e) {
        e.preventDefault();
        if (prefersReducedMotion) {
            window.scrollTo(0, 0);
        } else {
            $('html, body').animate({ scrollTop: 0 }, 600);
        }
        var $main = $('#main-content');
        if ($main.length > 0) {
            $main.attr('tabindex', '-1').trigger('focus');
        }
        return false;
    });

})(jQuery);
