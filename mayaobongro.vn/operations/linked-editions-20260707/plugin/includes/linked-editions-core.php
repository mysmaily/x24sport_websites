<?php

declare(strict_types=1);

function mayaobongro_linked_editions_normalize_level(mixed $level): ?string
{
    if (!is_string($level)) {
        return null;
    }

    $value = trim(mb_strtolower($level, 'UTF-8'));
    $aliases = [
        'tieu-hoc' => 'tieu-hoc',
        'tiểu học' => 'tieu-hoc',
        'lop-4-5' => 'tieu-hoc',
        'lớp 4-5' => 'tieu-hoc',
        'trung-hoc' => 'trung-hoc',
        'trung học' => 'trung-hoc',
        'thpt' => 'trung-hoc',
        'lop-11-12' => 'trung-hoc',
        'lớp 11-12' => 'trung-hoc',
    ];

    return $aliases[$value] ?? null;
}

function mayaobongro_linked_editions_build_options(array $current, array $sibling): array
{
    $currentLevel = mayaobongro_linked_editions_normalize_level($current['level'] ?? null);
    $siblingLevel = mayaobongro_linked_editions_normalize_level($sibling['level'] ?? null);
    $currentId = (int) ($current['id'] ?? 0);
    $siblingId = (int) ($sibling['id'] ?? 0);

    if (
        !$currentLevel
        || !$siblingLevel
        || $currentLevel === $siblingLevel
        || $currentId < 1
        || $siblingId < 1
        || $currentId === $siblingId
        || empty($current['published'])
        || empty($sibling['published'])
        || empty($current['url'])
        || empty($sibling['url'])
    ) {
        return [];
    }

    $labels = [
        'tieu-hoc' => ['label' => 'Tiểu học', 'detail' => 'Lớp 4–5'],
        'trung-hoc' => ['label' => 'Trung học', 'detail' => 'Lớp 11–12'],
    ];

    $items = [];
    foreach ([$current, $sibling] as $product) {
        $level = mayaobongro_linked_editions_normalize_level($product['level']);
        $items[$level] = [
            'id' => (int) $product['id'],
            'level' => $level,
            'label' => $labels[$level]['label'],
            'detail' => $labels[$level]['detail'],
            'url' => (string) $product['url'],
            'current' => (int) $product['id'] === $currentId,
        ];
    }

    return [
        $items['tieu-hoc'],
        $items['trung-hoc'],
    ];
}

function mayaobongro_linked_editions_is_reciprocal_pair(array $first, array $second): bool
{
    $firstId = (int) ($first['id'] ?? 0);
    $secondId = (int) ($second['id'] ?? 0);
    $firstLevel = mayaobongro_linked_editions_normalize_level($first['level'] ?? null);
    $secondLevel = mayaobongro_linked_editions_normalize_level($second['level'] ?? null);
    $firstGroup = trim((string) ($first['group'] ?? ''));
    $secondGroup = trim((string) ($second['group'] ?? ''));

    return $firstId > 0
        && $secondId > 0
        && $firstId !== $secondId
        && $firstLevel !== null
        && $secondLevel !== null
        && $firstLevel !== $secondLevel
        && $firstGroup !== ''
        && hash_equals($firstGroup, $secondGroup)
        && (int) ($first['linked_id'] ?? 0) === $secondId
        && (int) ($second['linked_id'] ?? 0) === $firstId;
}

function mayaobongro_linked_editions_extract_slug(mixed $requestPath): ?string
{
    if (!is_string($requestPath) || $requestPath === '') {
        return null;
    }

    $path = parse_url($requestPath, PHP_URL_PATH);
    if (!is_string($path)) {
        return null;
    }

    $segments = array_values(array_filter(
        explode('/', trim(rawurldecode($path), '/')),
        static fn(string $segment): bool => $segment !== ''
    ));
    if (count($segments) !== 1) {
        return null;
    }

    $slug = mb_strtolower($segments[0], 'UTF-8');

    return preg_match('/^[a-z0-9-]+$/', $slug) === 1 ? $slug : null;
}

function mayaobongro_linked_editions_is_age_gallery_model(mixed $model): bool
{
    return is_string($model)
        && trim(mb_strtolower($model, 'UTF-8')) === 'single-product';
}

function mayaobongro_linked_editions_normalize_age_keywords(mixed $keywords): array
{
    if (is_array($keywords)) {
        $raw = implode(',', array_map('strval', $keywords));
    } elseif (is_string($keywords)) {
        $raw = $keywords;
    } else {
        return [];
    }

    $parts = preg_split('/[,|\n]+/u', $raw) ?: [];
    $normalized = [];
    foreach ($parts as $part) {
        $keyword = trim(preg_replace('/\s+/u', ' ', mb_strtolower($part, 'UTF-8')) ?? '');
        if ($keyword === '' || in_array($keyword, $normalized, true)) {
            continue;
        }
        $normalized[] = $keyword;
    }

    return $normalized;
}

function mayaobongro_linked_editions_normalize_category_level(mixed $value): ?string
{
    if (!is_string($value)) {
        return null;
    }

    $normalized = trim(mb_strtolower($value, 'UTF-8'));
    if ($normalized === '') {
        return null;
    }

    $aliases = [
        'ao-bong-ro-tre-em' => 'tieu-hoc',
        'tre-em' => 'tieu-hoc',
        'tiểu học' => 'tieu-hoc',
        'tieu-hoc' => 'tieu-hoc',
        'ao-bong-ro-tieu-hoc-lop-4-5' => 'tieu-hoc',
        'ao-bong-ro-nguoi-lon' => 'trung-hoc',
        'trung học' => 'trung-hoc',
        'trung-hoc' => 'trung-hoc',
        'thpt' => 'trung-hoc',
        'nguoi-lon' => 'trung-hoc',
        'người lớn' => 'trung-hoc',
        'ao-bong-ro-trung-hoc-lop-11-12' => 'trung-hoc',
    ];

    return $aliases[$normalized] ?? null;
}

function mayaobongro_linked_editions_normalize_audience_level(mixed $value): ?string
{
    if (!is_string($value)) {
        return null;
    }

    $normalized = trim(mb_strtolower($value, 'UTF-8'));
    if ($normalized === '') {
        return null;
    }

    $aliases = [
        'ao-bong-ro-tre-em' => 'tieu-hoc',
        'tre-em' => 'tieu-hoc',
        'trẻ em' => 'tieu-hoc',
        'kids' => 'tieu-hoc',
        'children' => 'tieu-hoc',
        'ao-bong-ro-tieu-hoc-lop-4-5' => 'tieu-hoc',
        'tiểu học' => 'tieu-hoc',
        'tieu-hoc' => 'tieu-hoc',
        'ao-bong-ro-nguoi-lon' => 'trung-hoc',
        'nguoi-lon' => 'trung-hoc',
        'người lớn' => 'trung-hoc',
        'adults' => 'trung-hoc',
        'adult' => 'trung-hoc',
        'ao-bong-ro-trung-hoc-lop-11-12' => 'trung-hoc',
        'trung học' => 'trung-hoc',
        'trung-hoc' => 'trung-hoc',
        'thpt' => 'trung-hoc',
    ];

    return $aliases[$normalized] ?? null;
}

function mayaobongro_linked_editions_resolve_unique_audience_level(array $candidates): ?string
{
    $levels = [];
    foreach ($candidates as $candidate) {
        $level = mayaobongro_linked_editions_normalize_audience_level($candidate)
            ?? mayaobongro_linked_editions_normalize_category_level($candidate)
            ?? mayaobongro_linked_editions_normalize_level($candidate);
        if (!$level || in_array($level, $levels, true)) {
            continue;
        }
        $levels[] = $level;
    }

    return count($levels) === 1 ? $levels[0] : null;
}

function mayaobongro_linked_editions_resolve_unique_category_level(array $candidates): ?string
{
    $levels = [];
    foreach ($candidates as $candidate) {
        $level = mayaobongro_linked_editions_normalize_category_level($candidate)
            ?? mayaobongro_linked_editions_normalize_level($candidate);
        if (!$level || in_array($level, $levels, true)) {
            continue;
        }
        $levels[] = $level;
    }

    return count($levels) === 1 ? $levels[0] : null;
}

function mayaobongro_linked_editions_pick_archive_image_id(
    mixed $contextLevel,
    array $ageImageIds,
    mixed $fallbackImageId
): int {
    $level = mayaobongro_linked_editions_resolve_unique_audience_level([$contextLevel]);
    $fallback = max(0, (int) $fallbackImageId);

    if (!$level) {
        return $fallback;
    }

    $selected = max(0, (int) ($ageImageIds[$level] ?? 0));

    return $selected > 0 ? $selected : $fallback;
}

function mayaobongro_linked_editions_should_render_age_fit_box(mixed $model): bool
{
    if (mayaobongro_linked_editions_is_age_gallery_model($model)) {
        return false;
    }

    return false;
}
