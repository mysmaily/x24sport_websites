<?php
/**
 * Template hiển thị sản phẩm trong vòng lặp
 * Custom lại từ Flatsome + layout riêng
 */

defined( 'ABSPATH' ) || exit;

global $product;

// Kiểm tra sản phẩm hợp lệ
if ( ! is_a( $product, WC_Product::class ) || ! $product->is_visible() ) {
	return;
}

$out_of_stock = ! $product->is_in_stock();
$review_count = (int) $product->get_review_count();
$average_rating = (float) $product->get_average_rating();
$sales_count = (int) $product->get_total_sales();
$product_id = (int) $product->get_id();
$seed = abs( crc32( (string) $product_id ) );
$display_review_count = $review_count > 0 ? $review_count : 84 + ( $seed % 77 );
$display_rating = $average_rating > 0 ? $average_rating : 4.8 + ( ( $seed % 3 ) / 10 );
if ( $display_rating > 5 ) {
	$display_rating = 5.0;
}

// Class sản phẩm
$classes   = array();
$classes[] = 'product-small';
$classes[] = 'col';
$classes[] = 'has-hover';
if ( $out_of_stock ) $classes[] = 'out-of-stock';
?>

<div <?php wc_product_class( $classes, $product ); ?>>
	<div class="col-inner">
		<div class="product-small box <?php echo flatsome_product_box_class(); ?>">

			<!-- Nội dung custom -->
			<div class="box-text <?php echo flatsome_product_box_text_class(); ?>">

				<div class="custom-product-card">
					<!-- Ảnh sản phẩm -->
					<div class="product-thumbnail">
						<a href="<?php the_permalink(); ?>">
								<?php echo $product->get_image( 'medium' ); ?>
						</a>
					</div>

          <!-- Tiêu đề -->
					<h2 class="woocommerce-loop-product__title">
						<a href="<?php the_permalink(); ?>"><?php the_title(); ?></a>
					</h2>

					<!-- Giá -->
					<div class="buy-button">
						<div class="price">
							<?php if ( $product->is_on_sale() ) : ?>
								<strong><?php echo wc_price( $product->get_sale_price() ); ?></strong>
								<del><?php echo wc_price( $product->get_regular_price() ); ?></del>
							<?php else : ?>
								<strong><?php echo wc_price( $product->get_regular_price() ); ?></strong>
							<?php endif; ?>
						</div>
					</div>

					<div class="rating" aria-label="<?php echo esc_attr( sprintf( '%s trên 5 sao từ %d lượt đánh giá', wc_format_decimal( $display_rating, 1 ), $display_review_count ) ); ?>">
						<span class="x24-stars" aria-hidden="true">
							<span>&#9733;</span><span>&#9733;</span><span>&#9733;</span><span>&#9733;</span><span>&#9733;</span>
						</span>
						<small class="review-count"><?php echo esc_html( sprintf( '%d Lượt đánh giá', $display_review_count ) ); ?></small>
					</div>

					<?php if ( $sales_count > 0 ) : ?>
						<div class="sales-progress">
							<div class="sales-count"><?php echo esc_html( sprintf( 'Đã bán %d', $sales_count ) ); ?></div>
						</div>
					<?php endif; ?>

				</div>

			</div>

		</div>
	</div>
</div>
