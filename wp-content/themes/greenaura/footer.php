<?php
/**
 * The template for displaying the footer.
 *
 * Contains the closing of the #content div and all content after
 *
 * @package storefront
 */

?>

		</div><!-- .col-full -->
	</div><!-- #content -->

	<?php do_action( 'storefront_before_footer' ); ?>

<hr class="line-footer">
<footer id="footer" class="footer">
    <div class="col-full container-fluid">
        <div class="row">
            <div class="col-md-4 text-left">
                <h2>ТМ "Грин Аура"</h2>
                <div class="diviner-block hidden-md hidden-lg">
                </div>
                <ul class="nav nav-pills nav-stacked">
                    <li>
                        <a href="/">Главная</a>
                    </li>
                    <li>
                        <a href="/shop/">Магазин</a>
                    </li>
                    <li>
                        <a href="/cart/">Моя Корзина</a>
                    </li>
                </ul>
            </div>
            <div class="col-md-4 text-center">
                <div class="diviner-block hidden-xs hidden-sm">
                </div>
                <ul class="nav nav-pills navbar-icons">
                    <li>
                        <a href="https://www.facebook.com/Грин-Аура-375656359827338/" target="_blank" class="icon fa fa-facebook"></a>
                    </li>
                    <li>
                        <a class="icon fa fa-instagram"></a>
                    </li>
                </ul>

            </div>
            <div class="col-md-4 text-right">
                <ul class="nav nav-pills nav-stacked ul-lang">
                    <li>
                        <a class="active" href="/account/">Аккаунт</a>
                    </li>
                    <li>
                        <a class="active" href="/private-policy/">Политика конфиденциальности</a>
                    </li>
                </ul>
            </div>
        </div>
    </div>
</footer>

</div>
<!--	<footer id="colophon" class="site-footer" role="contentinfo">-->
<!--		<div class="col-full">-->

			<?php
			/**
			 * Functions hooked in to storefront_footer action
			 *
			 * @hooked storefront_footer_widgets - 10
			 * @hooked storefront_credit         - 20
			 */
//			do_action( 'storefront_footer' );
			?>

<!--		</div>-->
<!-- .col-full -->
<!--	</footer>-->
<!-- #colophon -->


	<?php do_action( 'storefront_after_footer' ); ?>

</div><!-- #page -->

<?php wp_footer(); ?>

</body>
</html>
