<?php

declare(strict_types=1);

$failures = [];

function expect_same(mixed $expected, mixed $actual, string $message): void
{
    global $failures;

    if ($expected !== $actual) {
        $failures[] = sprintf(
            "%s\nExpected: %s\nActual:   %s",
            $message,
            var_export($expected, true),
            var_export($actual, true)
        );
    }
}

function expect_true(bool $actual, string $message): void
{
    expect_same(true, $actual, $message);
}

$implementation = dirname(__DIR__) . '/plugin/includes/linked-editions-core.php';
if (is_file($implementation)) {
    require $implementation;
}

expect_true(
    function_exists('mayaobongro_linked_editions_normalize_level'),
    'Core must expose a school-level normalizer.'
);

expect_true(
    function_exists('mayaobongro_linked_editions_build_options'),
    'Core must expose ordered edition-option construction.'
);

expect_true(
    function_exists('mayaobongro_linked_editions_is_reciprocal_pair'),
    'Core must validate reciprocal product pairing.'
);

expect_true(
    function_exists('mayaobongro_linked_editions_extract_slug'),
    'Core must safely extract a product slug from a request path.'
);

expect_true(
    function_exists('mayaobongro_linked_editions_is_age_gallery_model'),
    'Core must expose the single-product age-gallery model detector.'
);

expect_true(
    function_exists('mayaobongro_linked_editions_normalize_age_keywords'),
    'Core must expose age-keyword normalization for single-product search coverage.'
);

expect_true(
    function_exists('mayaobongro_linked_editions_should_render_age_fit_box'),
    'Core must expose whether the age-fit UI box should render.'
);

expect_true(
    function_exists('mayaobongro_linked_editions_normalize_category_level'),
    'Core must expose category-level normalization for archive thumbnail context.'
);

expect_true(
    function_exists('mayaobongro_linked_editions_normalize_audience_level'),
    'Core must expose audience-level normalization for tag and page filter context.'
);

expect_true(
    function_exists('mayaobongro_linked_editions_pick_archive_image_id'),
    'Core must expose archive thumbnail image selection for age-gallery products.'
);

expect_true(
    function_exists('mayaobongro_linked_editions_resolve_unique_category_level'),
    'Core must expose unique category-level resolution from multiple candidates.'
);

expect_true(
    function_exists('mayaobongro_linked_editions_resolve_unique_audience_level'),
    'Core must expose unique audience-level resolution from multiple candidates.'
);

if (!$failures) {
    expect_same(
        'tieu-hoc',
        mayaobongro_linked_editions_normalize_level('Tiểu học'),
        'Vietnamese elementary label must normalize to tieu-hoc.'
    );
    expect_same(
        'trung-hoc',
        mayaobongro_linked_editions_normalize_level('thpt'),
        'THPT alias must normalize to trung-hoc.'
    );
    expect_same(
        null,
        mayaobongro_linked_editions_normalize_level('đại học'),
        'Unsupported levels must be rejected.'
    );

    $options = mayaobongro_linked_editions_build_options(
        [
            'id' => 2121,
            'level' => 'trung-hoc',
            'url' => 'https://mayaobongro.vn/ao-bong-ro-trung-hoc-demo/',
            'published' => true,
        ],
        [
            'id' => 3121,
            'level' => 'tieu-hoc',
            'url' => 'https://mayaobongro.vn/ao-bong-ro-tieu-hoc-demo/',
            'published' => true,
        ]
    );

    expect_same(
        ['tieu-hoc', 'trung-hoc'],
        array_column($options, 'level'),
        'Edition options must always be ordered elementary then high school.'
    );
    expect_same(
        [false, true],
        array_column($options, 'current'),
        'Exactly the current product must be marked selected.'
    );

    $missingSibling = mayaobongro_linked_editions_build_options(
        [
            'id' => 2121,
            'level' => 'trung-hoc',
            'url' => 'https://mayaobongro.vn/ao-bong-ro-trung-hoc-demo/',
            'published' => true,
        ],
        [
            'id' => 3121,
            'level' => 'tieu-hoc',
            'url' => '',
            'published' => false,
        ]
    );
    expect_same(
        [],
        $missingSibling,
        'Switcher must not render when the sibling is missing or unpublished.'
    );

    expect_true(
        mayaobongro_linked_editions_is_reciprocal_pair(
            ['id' => 2121, 'level' => 'trung-hoc', 'linked_id' => 3121, 'group' => 'x24-cb-059'],
            ['id' => 3121, 'level' => 'tieu-hoc', 'linked_id' => 2121, 'group' => 'x24-cb-059']
        ),
        'Different levels with matching group and reciprocal IDs must validate.'
    );
    expect_same(
        false,
        mayaobongro_linked_editions_is_reciprocal_pair(
            ['id' => 2121, 'level' => 'trung-hoc', 'linked_id' => 3121, 'group' => 'x24-cb-059'],
            ['id' => 3121, 'level' => 'trung-hoc', 'linked_id' => 2121, 'group' => 'x24-cb-059']
        ),
        'Two products with the same level must not validate as a pair.'
    );

    expect_same(
        'ao-chay-bo-cu',
        mayaobongro_linked_editions_extract_slug('/ao-chay-bo-cu/'),
        'A root product path must yield its slug.'
    );
    expect_same(
        null,
        mayaobongro_linked_editions_extract_slug('/category/ao-chay-bo-cu/'),
        'Nested paths must not be treated as root product permalinks.'
    );
    expect_same(
        null,
        mayaobongro_linked_editions_extract_slug('/'),
        'The homepage must never be treated as an old product slug.'
    );

    expect_true(
        mayaobongro_linked_editions_is_age_gallery_model('single-product'),
        'The new single-product age-gallery model must be detected.'
    );
    expect_same(
        false,
        mayaobongro_linked_editions_is_age_gallery_model('tieu-hoc'),
        'Legacy school levels must not be treated as the age-gallery model.'
    );
    expect_same(
        [
            'áo bóng rổ tiểu học',
            'áo bóng rổ lớp 9',
            'áo bóng rổ học sinh cấp 3',
        ],
        mayaobongro_linked_editions_normalize_age_keywords(
            " áo bóng rổ tiểu học , áo bóng rổ lớp 9\náo bóng rổ tiểu học|áo bóng rổ học sinh cấp 3 "
        ),
        'Age keywords must be split, trimmed, de-duplicated, and order-preserving.'
    );
    expect_same(
        false,
        mayaobongro_linked_editions_should_render_age_fit_box('single-product'),
        'Single-product age-gallery products must not render the temporary age-fit UI box.'
    );
    expect_same(
        'tieu-hoc',
        mayaobongro_linked_editions_normalize_category_level('ao-bong-ro-tre-em'),
        'The student/kids category must map to the elementary archive context.'
    );
    expect_same(
        'trung-hoc',
        mayaobongro_linked_editions_normalize_category_level('ao-bong-ro-nguoi-lon'),
        'The adult category slug must map to the adult archive context.'
    );
    expect_same(
        null,
        mayaobongro_linked_editions_normalize_category_level('bo-quan-ao-bong-ro'),
        'Neutral product categories must not force an age-specific archive image.'
    );
    expect_same(
        'tieu-hoc',
        mayaobongro_linked_editions_normalize_audience_level('trẻ em'),
        'Kids audience labels must normalize to the elementary context.'
    );
    expect_same(
        'trung-hoc',
        mayaobongro_linked_editions_normalize_audience_level('ao-bong-ro-nguoi-lon'),
        'The adult audience tag slug must normalize to the adult context.'
    );
    expect_same(
        null,
        mayaobongro_linked_editions_normalize_audience_level('thiet-ke-rieng'),
        'Neutral tags must not force an audience context.'
    );
    expect_same(
        2791,
        mayaobongro_linked_editions_pick_archive_image_id(
            'tieu-hoc',
            ['tieu-hoc' => 2791, 'trung-hoc' => 2792],
            888
        ),
        'Elementary archives must use the elementary age-gallery image when available.'
    );
    expect_same(
        2792,
        mayaobongro_linked_editions_pick_archive_image_id(
            'trung-hoc',
            ['tieu-hoc' => 2791, 'trung-hoc' => 2792],
            888
        ),
        'High-school archives must use the high-school age-gallery image when available.'
    );
    expect_same(
        888,
        mayaobongro_linked_editions_pick_archive_image_id(
            'trung-hoc',
            ['tieu-hoc' => 2791, 'trung-hoc' => 0],
            888
        ),
        'Archive image selection must fall back to the featured image when the requested age image is missing.'
    );
    expect_same(
        'tieu-hoc',
        mayaobongro_linked_editions_resolve_unique_category_level(
            ['bo-quan-ao-bong-ro', 'ao-bong-ro-tre-em', 'tiểu học']
        ),
        'A candidate list with only the kids category level must resolve to tieu-hoc.'
    );
    expect_same(
        'trung-hoc',
        mayaobongro_linked_editions_resolve_unique_category_level(
            ['ao-bong-ro-nguoi-lon', 'người lớn']
        ),
        'A candidate list with only the adult category level must resolve to trung-hoc.'
    );
    expect_same(
        null,
        mayaobongro_linked_editions_resolve_unique_category_level(
            ['ao-bong-ro-tre-em', 'ao-bong-ro-nguoi-lon']
        ),
        'Mixed kids and adult candidates must stay unresolved to avoid picking the wrong archive image.'
    );
    expect_same(
        'tieu-hoc',
        mayaobongro_linked_editions_resolve_unique_audience_level(
            ['bo-quan-ao-bong-ro', 'ao-bong-ro-tre-em', 'trẻ em']
        ),
        'Tag and page-filter candidates for kids must resolve to the elementary audience.'
    );
    expect_same(
        'trung-hoc',
        mayaobongro_linked_editions_resolve_unique_audience_level(
            ['ao-bong-ro-nguoi-lon', 'người lớn']
        ),
        'Adult tag and page-filter candidates must resolve to the adult audience.'
    );
    expect_same(
        null,
        mayaobongro_linked_editions_resolve_unique_audience_level(
            ['ao-bong-ro-tre-em', 'ao-bong-ro-nguoi-lon']
        ),
        'Mixed audience candidates must stay unresolved to avoid cross-audience image leakage.'
    );
}

if ($failures) {
    fwrite(STDERR, "FAIL\n\n" . implode("\n\n", $failures) . "\n");
    exit(1);
}

echo "PASS: linked-editions core behavior\n";
