<?php
define( 'PARSER_SITR_TYPE', 'GREENAURA' );
require_once get_theme_file_path('../parser-core/functions.php');

//add_action( 'wp_enqueue_scripts', 'my_bootstrap_css', 1);
function my_bootstrap_css() {
    wp_register_style( 'bootstrap-css', '/wp-content/themes/greenaura/assets/css/bootstrap.css', false, '1', 'all');
    wp_enqueue_style( 'bootstrap-css' );
}
//add_action( 'wp_enqueue_scripts', 'my_alex_css', 10);
function my_alex_css() {
    wp_register_style( 'alex-css', '/wp-content/themes/greenaura/assets/css/alex.css', false, '1', 'all');
    wp_enqueue_style( 'alex-css' );
}
add_action( 'wp_enqueue_scripts', 'my_alex_js', 1);
function my_alex_js() {
    wp_register_script( 'alex-js', '/wp-content/themes/greenaura/assets/js/alex.js', false, '1', true);
    wp_enqueue_script( 'alex-js' );
}


//remove_filter( 'the_content', 'wpautop' ); //убрать переносы



//Disable REST API link tag
remove_action('wp_head', 'rest_output_link_wp_head', 10);
//Disable oEmbed Discovery Links
remove_action('wp_head', 'wp_oembed_add_discovery_links', 10);
//Disable REST API link in HTTP headers
remove_action('template_redirect', 'rest_output_link_header', 11, 0);
remove_action('wp_head','feed_links_extra', 3); // убирает ссылки на rss категорий
remove_action('wp_head','feed_links', 2); // минус ссылки на основной rss и комментарии
remove_action('wp_head','rsd_link');  // сервис Really Simple Discovery
remove_action('wp_head','wlwmanifest_link'); // Windows Live Writer
remove_action('wp_head','wp_generator');  // скрыть версию wordpress


//add_filter('after_setup_theme', 'remove_redundant_shortlink');
//function remove_redundant_shortlink() {
//    // remove HTML meta tag
//    // <link rel='shortlink' href='http://example.com/?p=25' />
//    remove_action('wp_head', 'wp_shortlink_wp_head', 10);
//
//    // remove HTTP header
//    // Link: <https://example.com/?p=25>; rel=shortlink
//    remove_action( 'template_redirect', 'wp_shortlink_header', 11);
//}


//Добавляем кастомнные теги
add_action('init', 'edit_html_tags_in_comments', 10);
function edit_html_tags_in_comments() {
//define('CUSTOM_TAGS', true);
    global $allowedtags;
    $allowedtags_add = array (
        'pre' => array(
            'class' => array()
        ),
        'strong' => array(
            'class' => array(),
            'style' => array(),
            'itemprop' => array(),
            'itemtype' => array(),
            'itemscope' => array(),
        ),
        'div' => array(
            'class' => array(),
            'style' => array(),
            'itemprop' => array(),
            'itemtype' => array(),
            'itemscope' => array(),
        ),
        'span' => array(
            'class' => array(),
            'style' => array(),
            'itemprop' => array(),
            'itemtype' => array(),
            'itemscope' => array(),
        ),
        'p' => array(
            'class' => array(),
            'style' => array(),
            'itemprop' => array(),
            'itemtype' => array(),
            'itemscope' => array(),
        ),

    );
    $allowedtags = array_merge ($allowedtags, $allowedtags_add);
}


//add_action( 'wp_enqueue_scripts', 'my_jquery_cdn_method', 1);
function my_jquery_cdn_method() {
    // получаем версию jQuery
    wp_enqueue_script( 'jquery' );
    // для версий WP меньше 3.6 'jquery' нужно поменять на 'jquery-core'
    $wp_jquery_ver = $GLOBALS['wp_scripts']->registered['jquery']->ver;
    $jquery_ver = $wp_jquery_ver == '' ? '1.12.4' : $wp_jquery_ver;
    // отменяем зарегистрированный jQuery
    wp_deregister_script( 'jquery-core' );
//    wp_deregister_script( 'jquery' );
    // регистрируем
//    wp_register_script( 'jquery-core', '//ajax.googleapis.com/ajax/libs/jquery/'. $jquery_ver .'/jquery.min.js', false, null, true);
    wp_register_script( 'jquery-core', '//ajax.googleapis.com/ajax/libs/jquery/2.2.0/jquery.min.js', false, '2.2.0', true);
//    wp_register_script('jquery', false, array('jquery-core'), null, true);

    //wp_deregister_script( 'jquery-migrate' );
    //wp_register_script( 'jquery-migrate', "//cdnjs.cloudflare.com/ajax/libs/jquery-migrate/1.3.0/jquery-migrate.min.js", array(), '1.3.0',true);


    // подключаем
    wp_enqueue_script( 'jquery' );
}


add_action( 'wp_print_styles', 'my_font_awesome_cdn', 1);
function my_font_awesome_cdn() {
    wp_deregister_style( 'fontawesome' );
    wp_register_style( 'fontawesome', '//cdnjs.cloudflare.com/ajax/libs/font-awesome/4.7.0/css/font-awesome.css', false, '4.7.0', 'all');
    wp_enqueue_style( 'fontawesome' );
}




add_action('wp_head', 'print_only_header_style', 20);
function print_only_header_style () {
    echo '<link rel="stylesheet" href="/wp-content/themes/greenaura/assets/css/alex.css" type="text/css" media="all"/>';
}
add_action('wp_head', 'print_only_header_css', 8);
function print_only_header_css () {
    $header_link = array('storefront-child-style','storefront-style','storefront-woocommerce-style','bootstrap-css');//,'fontawesome'  'storefront-style',
    global  $wp_styles;
    echo '<link rel="stylesheet" href="/wp-content/themes/greenaura/assets/css/bootstrap.css" type="text/css" media="all"/>';
    foreach( $header_link as $link ) {
        if (!isset($wp_styles->registered[$link])) {break;}
        $handle = $wp_styles->registered[$link]->handle;
        $href = $wp_styles->registered[$link]->src;

        //$href = str_replace('https://smartcloudconnect.io/','/',$href);

        if ($link == "storefront-style") {

            if (isset($wp_styles->registered[$link]->extra['after'][0])) {
                echo "<style>".$wp_styles->registered[$link]->extra['after'][0]."</style>";
            }
//            if (can_browser_async_css()) {
//                echo "<link rel='preload' id='$handle-css' href='$href' type='text/css' as='style' onload=\"this.rel='stylesheet';\">";
//            } else  {
//                echo '<script async id="'.$handle.'-css-js">var async_css = document.createElement( "link" );async_css.rel = "stylesheet";async_css.id = "'.$handle.'-css";async_css.href = "'.$href.'";document.head.insertBefore( async_css, document.head.childNodes[ document.head.childNodes.length - 1 ].nextSibling );</script>';
//            }
        } else {
//                echo "<link rel='stylesheet' id='$handle-css' href='$href' type='text/css' media='all' />";
            echo "<link rel='stylesheet' href='$href' type='text/css' media='all' />";
            if (isset($wp_styles->registered[$link]->extra['after'][0])) {
                echo "<style>".$wp_styles->registered[$link]->extra['after'][0]."</style>";
            }

        }

        wp_deregister_style($link);
        wp_dequeue_style($link);
//        echo '<link rel="stylesheet" href="/wp-content/themes/greenaura/assets/css/alex.css" type="text/css" media="all"/>';
//            unset($wp_styles->registered[$link]);
    }
    function delete_styles_queue() {
        wp_deregister_style( 'bootstrap-css' );
        wp_deregister_style( 'storefront-style');
        wp_deregister_style( 'storefront-child-style');
//        wp_deregister_style( 'fontawesome' );
//        wp_deregister_style( 'alex-css' );
        wp_deregister_style( 'storefront-woocommerce-style' );
    }
    add_action( 'wp_print_styles', 'delete_styles_queue', 100 );
}



//add_action( 'after_setup_theme', 'footer_enqueue_scripts' );
//function footer_enqueue_scripts() {
//    remove_action('wp_head', 'download_rss_link'); //RRS meta
//
//    remove_action('wp_head', 'wp_print_scripts');
//    remove_action('wp_head', 'wp_enqueue_scripts', 2);
//    remove_action('wp_head', 'wp_print_styles',8);
//    remove_action('wp_head', 'wp_print_head_scripts', 9);
////    wp_enqueue_style
////    style_loader_tag
//    add_action('wp_footer','wp_print_scripts',4);
//    add_action('wp_footer','wp_enqueue_scripts',5);
//    add_action('wp_footer','wp_print_styles',6);
//    add_action('wp_footer','wp_print_head_scripts',7);
//}


add_action( 'init', 'remove_hooks', 100 );
function remove_hooks() {
    remove_action( 'storefront_header', 'storefront_site_branding', 20 );//logo remove because hidden
}







add_filter( 'woocommerce_default_address_fields' , 'custom_override_default_address_fields' );
// Our hooked in function - $address_fields is passed via the filter!
function custom_override_default_address_fields( $address_fields )
{
//    $address_fields['address_1']['required'] = false;
//    $address_fields['address_1']['class'][] = 'hidden';
    $address_fields['address_2']['placeholder'] = 'Квартира и т.д. или отделение Новой Почты';
    $address_fields['postcode']['required'] = false;
    $address_fields['state']['required'] = false;
    $address_fields['country']['required'] = false;
//echo var_dump($address_fields['address_1']); exit;
    return $address_fields;
}

add_filter( 'woocommerce_checkout_fields' , 'custom_override_checkout_fields_ek', 99 );
// Remove some fields from billing form
// Our hooked in function - $fields is passed via the filter!
// Get all the fields - https://docs.woothemes.com/document/tutorial-customising-checkout-fields-using-actions-and-filters/
function custom_override_checkout_fields_ek( $fields ) {
//    unset($fields['billing']['billing_company']);
//    unset($fields['billing']['billing_address_1']);
    unset($fields['billing']['billing_postcode']);
    unset($fields['billing']['billing_state']);
    return $fields;
}
add_filter('woocommerce_billing_fields','wpb_custom_billing_fields');
// remove some fields from billing form
// ref - https://docs.woothemes.com/document/tutorial-customising-checkout-fields-using-actions-and-filters/
function wpb_custom_billing_fields( $fields = array() ) {
//    unset($fields['billing_company']);
//    unset($fields['billing_address_1']);
//    unset($fields['billing_address_2']);
    unset($fields['billing_state']);
//    unset($fields['billing_city']);
//    unset($fields['billing_phone']);
    unset($fields['billing_postcode']);
//    unset($fields['billing_country']);
    return $fields;
}







//add_filter('script_loader_tag', 'add_async_attribute', 49, 2);
//function add_async_attribute($tag, $handle) {
//    // добавьте дескрипторы (названия) скриптов в массив ниже
//    $scripts_to_async = array('jquery-core');
//    foreach($scripts_to_async as $async_script) {
//        if ($async_script === $handle) {
//            return str_replace(' src', ' async src', $tag);
//        }
//    }
//    return $tag;
//}


$GLOBALS['first_time_defer'] = true;
$GLOBALS['scripts_to_defer'] = array('jquery',
    'jquery-ui-mouse',
    'js-cookie',
    'fusionb_builder-app',
    'jquery-migrate',
    'jquery-ui-autocomplete',
    'autosave',
    'wp-lists',
    'wp-pointer',
    'jquery-ui-accordion',
    'jquery-ui-spinner',
    'plupload',
    'avada',
    'revmin');
//add_filter('script_loader_tag', 'add_defer_attribute', 60, 2);
function add_defer_attribute($tag, $handle) {
    if( is_admin() ){return $tag;} //если в админке
    // добавьте дескрипторы (названия) скриптов в массив ниже
    if ($GLOBALS['first_time_defer']) {
        global  $wp_scripts;
        $check_deps = array('jquery');
        foreach( $wp_scripts->registered as $script ) {
            foreach ($script->deps as $dep) {
                if (!in_array($dep,$check_deps)) {
                    $check_deps[] = $dep;
                    $check_deps[] = $script->handle;
                    break;
                }
                $GLOBALS['scripts_to_defer'][] = $script->handle;
            }
        }
        $GLOBALS['first_time_defer'] = false;
        $GLOBALS['scripts_to_defer'] = array_unique($GLOBALS['scripts_to_defer']);
    }

    //$tag = str_replace('src="https://smartcloudconnect.io/','src="/',$tag);

    if( $handle == 'jquery-core' ) { //|| $handle == 'jquery-migrate'
        return $tag;
    }

    if ( in_array($handle,$GLOBALS['scripts_to_defer']) ){
//        return str_replace(' src', 'id="'.$handle.'-js" defer src', $tag);
//        return str_replace(' src', 'defer="defer" src', $tag);
        return str_replace(' src', 'defer="defer" src', $tag);
    } else {
        return str_replace(' src', 'defer="defer" src', $tag);
//        return str_replace(' src', 'id="'.$handle.'-js" async src', $tag);
        return str_replace(' src', 'async="async" src', $tag);
    }
}


//add_filter('style_loader_tag', 'async_load_css', 10, 4);
function async_load_css ($html, $handle, $href, $media) {
    if( is_admin() ){return $html;} //если в админке

    //$href = str_replace('https://smartcloudconnect.io/','/',$href);

    if( can_browser_async_css() ) {
        return str_replace(" rel='stylesheet'", " rel='preload' as='style' onload=\"this.rel='stylesheet';\" ", $html);
    } else {
//        return '<script async id="'.$handle.'-css-js">var async_css = document.createElement( "link" );async_css.id = "'.$handle.'-css";async_css.rel = "stylesheet";async_css.href = "'.$href.'";document.body.insertBefore( async_css, document.body.childNodes[ document.body.childNodes.length - 1 ].nextSibling );</script>';
        return '<script async>var async_css = document.createElement( "link" );async_css.rel = "stylesheet";async_css.href = "'.$href.'";document.body.insertBefore( async_css, document.body.childNodes[ document.body.childNodes.length - 1 ].nextSibling );</script>';
    }
}

function can_browser_async_css () {
    return false;
    $browser = user_min_browser();
    if ( stristr($browser,'Chrome') ||
        stristr($browser,'Safari') ||
        stristr($browser,'Chrome for IOS') ||
        stristr($browser,'Samsung Internet 7.2') )
    {
        return true;
    };
    return false;
}
function user_min_browser() {
    $agent = $_SERVER['HTTP_USER_AGENT'];
    $browser_info = [];
    if(!isset($agent)) {return "_";}
    preg_match("/(MSIE|Opera|Firefox|Chrome|Version)(?:\/| )([0-9.]+)/", $agent, $browser_info);
    list(,$browser,$version) = array_pad($browser_info,3,'_');
    if ($browser == 'Opera' && $version == '9.80') return 'Opera '.substr($agent,-5);
    if ($browser == 'Version') return 'Safari '.$version;
    if (!$browser && strpos($agent, 'Gecko')) return 'Browser based on Gecko';
    return $browser.' '.$version;
}










function speed_stop_loading_wp_embed() {
//        wp_deregister_script('wp-embed');
}
//add_action('init', 'speed_stop_loading_wp_embed');
// Disable Emoji Mess
function disable_wp_emojicons() {
    add_filter( 'tiny_mce_plugins', 'disable_emojicons_tinymce');
    remove_action('admin_print_styles', 'print_emoji_styles');
    remove_action('wp_head', 'print_emoji_detection_script', 1);
    remove_action('admin_print_scripts', 'print_emoji_detection_script');
    remove_action('wp_print_styles', 'print_emoji_styles');
    remove_filter('wp_mail', 'wp_staticize_emoji_for_email');
    remove_filter('the_content_feed', 'wp_staticize_emoji');
    remove_filter('comment_text_rss', 'wp_staticize_emoji');
}

function disable_emojicons_tinymce( $plugins ) {
    if (is_array($plugins)) {
        return array_diff($plugins, array('wpemoji'));
    } else {
        return array();
    }
}
//add_action('init', 'disable_wp_emojicons');


function _remove_script_version( $src ){
    $parts = explode( '?', $src );
    return $parts[0];
}
//add_filter( 'script_loader_src', '_remove_script_version', 15, 1 );
//add_filter( 'style_loader_src', '_remove_script_version', 15, 1 );

function my_myme_types($mime_types){
    $mime_types['svg'] = 'image/svg+xml';
    return $mime_types;
}
add_filter('upload_mimes', 'my_myme_types');





add_filter( 'woocommerce_quantity_input_args', 'bloomer_woocommerce_quantity_changes', 10, 2 );

function bloomer_woocommerce_quantity_changes( $args, $product ) {

    if ( ! is_cart() ) {

//        $args['input_value'] = 4; // Start from this value (default = 1)
        $args['max_value'] = 99; // Max quantity (default = -1)
//        $args['min_value'] = 4; // Min quantity (default = 0)
//        $args['step'] = 2; // Increment/decrement by this value (default = 1)

    } else {

        // Cart's "min_value" is already 0 and we don't need "input_value"
        $args['max_value'] = 99; // Max quantity (default = -1)
//        $args['step'] = 2; // Increment/decrement by this value (default = 0)
        // ONLY ADD FOLLOWING IF STEP < MIN_VALUE
//        $args['min_value'] = 4; // Min quantity (default = 0)

    }

    return $args;

}
// Variations
add_filter( 'woocommerce_available_variation', 'jk_woocommerce_available_variation' );

function jk_woocommerce_available_variation( $args ) {
    $args['max_qty'] = 99; // Maximum value (variations)
    $args['min_qty'] = 0; // Minimum value (variations)
    return $args;
}

//add_filter( 'comment_text', 'remove_html_from_comments' );
//function remove_html_from_comments( $comment_text ) {
//    return htmlspecialchars($comment_text);
//}