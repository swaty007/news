<?php
/**
 * The header for our theme.
 *
 * Displays all of the <head> section and everything up till <div id="content">
 *
 * @package storefront
 */

?><!doctype html>
<html <?php language_attributes(); ?>>
<head>
<meta charset="<?php bloginfo( 'charset' ); ?>">
<meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=2.0">
<link rel="profile" href="http://gmpg.org/xfn/11">
<link rel="pingback" href="<?php bloginfo( 'pingback_url' ); ?>">
<?php if (rand(0,5) === 5):?>
    <script data-ad-client="ca-pub-7558972045892090" async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js"></script>
<?php endif;?>
<?php wp_head(); ?>
</head>

<body <?php body_class(); ?>>

<?php do_action( 'storefront_before_site' ); ?>

<div id="page" class="hfeed site">
	<?php do_action( 'storefront_before_header' ); ?>

<div id="romb-layout" class="romb-layout">

    <header id="masthead" class="site-header" role="banner" style="<?php storefront_header_styles(); ?>">

        <?php
        /**
         * Functions hooked into storefront_header action
         *
         * @hooked storefront_header_container                 - 0
         * @hooked storefront_skip_links                       - 5
         * @hooked storefront_social_icons                     - 10
         * @hooked storefront_site_branding                    - 20
         * @hooked storefront_secondary_navigation             - 30
         * @hooked storefront_product_search                   - 40
         * @hooked storefront_header_container_close           - 41
         * @hooked storefront_primary_navigation_wrapper       - 42
         * @hooked storefront_primary_navigation               - 50
         * @hooked storefront_header_cart                      - 60
         * @hooked storefront_primary_navigation_wrapper_close - 68
         */
        do_action( 'storefront_header' );
        ?>

    </header><!-- #masthead -->

    <a href="/" class="romb">
        <div class="romb-height-fix">
<!--            <img class="logo-svg" src="http://greenaurasvg/%D0%91%D0%B5%D0%B7%D1%8B%D0%BC%D1%8F%D0%BD%D0%BD%D1%8B%D0%B9-1.svg" alt="">-->
            <svg xmlns="http://www.w3.org/2000/svg" id="logo_svg" data-name="logo_svg" viewBox="0 0 112.96 95.8" class="logo-svg"><defs><style>.cls-1,.cls-3{fill:#0ea42b;}.cls-1{fill-rule:evenodd;}.cls-2{fill:#00a32e;}</style></defs><title>Лого ГринАура</title><path class="cls-1" d="M62.59,32.82l4,3.86L65.3,31ZM70,50.31l-1.9,6.07,4.83-1.3ZM56.65,36.68l4-3.86L57.92,31Zm12,3.67,1.44,7L72.58,44Zm-7-8.38,3.31-2.22-3.31-7.34L58.3,29.75Zm-1.78-8.64a82.06,82.06,0,0,0-5.89,6.89c-.65.84-1.28,1.71-1.9,2.61L57,29.6ZM50.64,44l2.49,3.36,1.44-7ZM71.21,32.85c-.63-.92-1.27-1.81-1.93-2.66a86,86,0,0,0-5.89-6.89l2.86,6.3ZM76,41.33a47.53,47.53,0,0,0-2.59-5L74,42.74Zm-19.43-10-5.41,3.54-.61,7.45L55,38.26Zm11.63,6.91,4.46,4.08-.62-7.45-5.4-3.54ZM78,47.35a30.89,30.89,0,0,0-1.49-4.84L74.42,44ZM66.52,56.79l.09,0,2.47-7.86L69,48.78l.08-.11-2-9.77-5.46-5.29L56.15,38.9l-2,9.77.07.11-.07.12,2.47,7.86.1,0v.05l4.9,1.88,4.9-1.88ZM60.41,59.6l-3.59-1.38.3,4.15Zm6-1.38L62.82,59.6l3.28,2.77ZM55.18,56.38l-1.9-6.07-2.93,4.77Zm-.29,11,.87-3.06-5.41.13A17.07,17.07,0,0,0,54.89,67.34Zm12.8-9.57L67.31,63l6,.15,0-6.89ZM49.8,36.35a46.28,46.28,0,0,0-2.59,5l2.06,1.4ZM61.61,60.22l-4.12,3.46L61.61,68l4.12-4.35Zm1.11,8.45a16.75,16.75,0,0,0,4.44-.89l-.82-2.92Zm12-13.38,2.92,1.85a17.06,17.06,0,0,0,.87-5.33s0,0,0-.08c0-.54-.07-1.09-.12-1.64ZM73.51,44.81l-3,4,3.37,5.48,3.87-5.47Zm1,17.91a17.09,17.09,0,0,0,2.69-4.38l-2.74-1.73Zm-6.2,4.62a16.91,16.91,0,0,0,4.54-2.93l-5.4-.13ZM48.7,62.73l0-6.12L46,58.35A16.85,16.85,0,0,0,48.7,62.73Zm7.37,5.05a16.68,16.68,0,0,0,4.43.89l-3.62-3.81ZM46.72,42.51a31.33,31.33,0,0,0-1.51,4.84l3.6-3.4ZM44.8,50.08a14.87,14.87,0,0,0-.11,1.63s0,0,0,.1a16.73,16.73,0,0,0,.87,5.33l2.93-1.85Zm5.2,6.2,0,6.89,6-.15-.39-5.25ZM61.58,16.86s-20.21,18-20.21,35.08A20.18,20.18,0,0,0,60.21,72.07v4.29a1.37,1.37,0,1,0,2.73,0V72.07A20.19,20.19,0,0,0,81.79,51.94C81.79,34.79,61.58,16.86,61.58,16.86Zm0,53.12A18.16,18.16,0,0,1,43.44,51.91a.76.76,0,0,1,0-.2c0-7.69,4.7-16,9.51-22.24a85.92,85.92,0,0,1,8.23-9.3l.44-.43.44.43a84.46,84.46,0,0,1,8.22,9.26h0c4.8,6.28,9.48,14.56,9.5,22.3v.08A18.18,18.18,0,0,1,61.61,70ZM49.72,44.81l-4.26,4,3.88,5.47,3.37-5.48Z" transform="translate(-5.55 -16.86)"/><path class="cls-2" d="M21.64,90.37c-1.37.24-1.54.33-1.54,2v1.84a13.62,13.62,0,0,0,.14,2.33,35.3,35.3,0,0,1-5.47.79c-5.64,0-9.22-3.24-9.22-8.18C5.55,83.67,9.92,81,15,81a35.5,35.5,0,0,1,4.85.55c.05,1.06.27,2.88.44,4.2l-.94.17c-.53-1.87-1.42-3.12-2.9-3.63a6.69,6.69,0,0,0-2-.24c-2.9,0-5.23,2.36-5.23,6.65,0,4,1.53,7.56,5.47,7.56A3.2,3.2,0,0,0,16.26,96c.36-.21.55-.62.55-1.36V92.46c0-1.68-.33-1.85-2.35-2.09v-.89h7.18Z" transform="translate(-5.55 -16.86)"/><path class="cls-2" d="M29.29,96.94H23v-.81c1.28-.15,1.4-.27,1.4-1.71V89.17c0-1.2-.1-1.32-1.23-1.56v-.75A22.18,22.18,0,0,0,27.44,86v2.59C28.52,86.89,29.39,86,30.37,86a1.46,1.46,0,0,1,1.56,1.44,2.33,2.33,0,0,1-1.22,2,.68.68,0,0,1-.75-.12c-.41-.34-.72-.72-1.13-.72s-1,.31-1.39,1.22v4.56c0,1.44.17,1.52,1.85,1.71Z" transform="translate(-5.55 -16.86)"/><path class="cls-2" d="M42.37,94.59A5.47,5.47,0,0,1,38,97.23a4.89,4.89,0,0,1-5-5.23,6.29,6.29,0,0,1,1.8-4.32A5.37,5.37,0,0,1,38.48,86a3.93,3.93,0,0,1,4,3.91c0,.41,0,.82-.31.89-.45.12-3.84.29-6.17.38.1,2.55,1.51,3.84,3.24,3.84a4.1,4.1,0,0,0,2.74-1.08ZM38,87c-1,0-1.77,1.13-1.92,3L39,89.94c.33,0,.48-.08.48-.48C39.49,88.26,38.94,87,38,87Z" transform="translate(-5.55 -16.86)"/><path class="cls-2" d="M53.67,94.59a5.47,5.47,0,0,1-4.39,2.64,4.9,4.9,0,0,1-5-5.23A6.29,6.29,0,0,1,46,87.68,5.39,5.39,0,0,1,49.79,86a3.94,3.94,0,0,1,4,3.91c0,.41,0,.82-.32.89-.45.12-3.84.29-6.16.38.09,2.55,1.51,3.84,3.24,3.84a4.1,4.1,0,0,0,2.73-1.08ZM49.31,87c-1,0-1.78,1.13-1.92,3l2.9-.07c.34,0,.48-.08.48-.48C50.79,88.26,50.24,87,49.31,87Z" transform="translate(-5.55 -16.86)"/><path class="cls-2" d="M62.1,96.94v-.81c1-.15,1.08-.24,1.08-1.9v-4.1c0-1.71-.84-2.23-1.68-2.23a2.93,2.93,0,0,0-1.8.72v5.8c0,1.47.09,1.56,1.08,1.71v.81H55.21v-.81c1.25-.22,1.39-.24,1.39-1.8v-5c0-1.44-.19-1.52-1.25-1.73v-.77a25.47,25.47,0,0,0,4.4-.91c0,.33,0,1.17,0,1.73.48-.34,1-.7,1.53-1A3.31,3.31,0,0,1,63.11,86c1.94,0,3.16,1.42,3.16,3.86V94.4c0,1.49.15,1.56,1.3,1.73v.81Z" transform="translate(-5.55 -16.86)"/><path class="cls-2" d="M77.71,96.94v-.88c1.52-.22,1.52-.48,1.18-1.52-.24-.72-.62-1.8-1-2.76H73.23c-.27.75-.6,1.66-.84,2.4-.51,1.52.07,1.71,2,1.88v.88H68.42v-.88c1.52-.2,1.9-.41,2.72-2.43l5-12.41L77.28,81c1.54,4.17,3.17,8.45,4.73,12.45.89,2.24,1.1,2.4,2.66,2.6v.88ZM75.6,85.47c-.69,1.73-1.37,3.34-2,5.09h3.82Z" transform="translate(-5.55 -16.86)"/><path class="cls-2" d="M97.15,96.37c-1.44.19-3,.5-4.56.86V95.6a5.29,5.29,0,0,1-3.31,1.63c-2,0-3.14-1.29-3.14-3.43v-5c0-1.1-.15-1.22-.8-1.39l-.5-.14v-.77c1.22,0,3.12-.22,4.46-.41,0,1-.07,2.26-.07,3.62v3.51c0,1.56.79,2.09,1.63,2.09a2.16,2.16,0,0,0,1.73-.7V88.86c0-1.11-.12-1.3-.79-1.42l-.72-.14v-.77a46.09,46.09,0,0,0,4.63-.41v7.82c0,1.25.15,1.52.92,1.59l.52,0Z" transform="translate(-5.55 -16.86)"/><path class="cls-2" d="M104.5,96.94H98.16v-.81c1.27-.15,1.39-.27,1.39-1.71V89.17c0-1.2-.09-1.32-1.22-1.56v-.75a22.18,22.18,0,0,0,4.32-.91v2.59c1.08-1.65,1.94-2.54,2.93-2.54a1.46,1.46,0,0,1,1.56,1.44,2.32,2.32,0,0,1-1.23,2,.67.67,0,0,1-.74-.12c-.41-.34-.72-.72-1.13-.72s-1,.31-1.39,1.22v4.56c0,1.44.17,1.52,1.85,1.71Z" transform="translate(-5.55 -16.86)"/><path class="cls-2" d="M116,97.23a2.2,2.2,0,0,1-1.49-.5,2.37,2.37,0,0,1-.63-.89,8.91,8.91,0,0,1-2.54,1.39A3.16,3.16,0,0,1,108,94.14c0-1.28.58-1.85,1.85-2.36a19.85,19.85,0,0,0,3.87-1.58V89.14c0-1.24-.46-1.94-1.49-1.94a1.17,1.17,0,0,0-1,.48,4.44,4.44,0,0,0-.58,1.58,1,1,0,0,1-1,.82,1.48,1.48,0,0,1-1.42-1.25c0-.43.29-.74.84-1.13a11.89,11.89,0,0,1,3.84-1.7,4.23,4.23,0,0,1,2.48.7,3.25,3.25,0,0,1,1.32,3V93.8c0,1.15.38,1.44.77,1.44a1.77,1.77,0,0,0,.74-.19l.26.81Zm-2.21-6-1.35.75a1.72,1.72,0,0,0-1.17,1.63,1.63,1.63,0,0,0,1.46,1.82,1.36,1.36,0,0,0,1.06-.38Z" transform="translate(-5.55 -16.86)"/><path class="cls-3" d="M33.41,104.23H28.56v8.27h-.95v-9.1h5.79Z" transform="translate(-5.55 -16.86)"/><path class="cls-3" d="M41.19,104.23a3.13,3.13,0,0,1,0,4.57,4.14,4.14,0,0,1-2.73.82H36v2.88h-1v-9.1h3.4A4.09,4.09,0,0,1,41.19,104.23Zm-.69,4a2.33,2.33,0,0,0,0-3.37,3.11,3.11,0,0,0-2.06-.59H36v4.55h2.42A3.16,3.16,0,0,0,40.5,108.19Z" transform="translate(-5.55 -16.86)"/><path class="cls-3" d="M44.16,103.4h1v9.1h-1Z" transform="translate(-5.55 -16.86)"/><path class="cls-3" d="M55.78,103.4v9.1h-1v-4.2H49.14v4.2h-1v-9.1h1v4h5.69v-4Z" transform="translate(-5.55 -16.86)"/><path class="cls-3" d="M68.08,110.06H63l-1.09,2.44h-1l4.16-9.1h1l4.16,9.1h-1Zm-.35-.78-2.19-4.88-2.18,4.88Z" transform="translate(-5.55 -16.86)"/><path class="cls-3" d="M78.66,103.4l-4.14,7.65a3.25,3.25,0,0,1-1,1.22,2.28,2.28,0,0,1-1.29.39,3,3,0,0,1-1.12-.24l.27-.78a2.45,2.45,0,0,0,.86.18,1.69,1.69,0,0,0,1.47-1l.26-.44-3.69-7h1l3.18,6.16,3.25-6.16Z" transform="translate(-5.55 -16.86)"/><path class="cls-3" d="M86.29,104.23a3.13,3.13,0,0,1,0,4.57,4.14,4.14,0,0,1-2.73.82H81.12v2.88h-1v-9.1h3.41A4.09,4.09,0,0,1,86.29,104.23Zm-.69,4a2.33,2.33,0,0,0,0-3.37,3.15,3.15,0,0,0-2.07-.59H81.12v4.55h2.41A3.21,3.21,0,0,0,85.6,108.19Z" transform="translate(-5.55 -16.86)"/><path class="cls-3" d="M94.62,110.06H89.55l-1.09,2.44h-1l4.16-9.1h.95l4.16,9.1h-1Zm-.35-.78-2.18-4.88-2.19,4.88Z" transform="translate(-5.55 -16.86)"/></svg>
        </div>
    </a>
	<?php
	/**
	 * Functions hooked in to storefront_before_content
	 *
	 * @hooked storefront_header_widget_region - 10
	 * @hooked woocommerce_breadcrumb - 10
	 */
	do_action( 'storefront_before_content' );
	?>

	<div id="content" class="site-content" tabindex="-1">
		<div class="col-full">




		<?php
		do_action( 'storefront_content_top' );
