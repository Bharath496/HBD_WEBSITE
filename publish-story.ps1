param(
  [string]$Name,
  [string]$From,
  [string]$Opening,
  [string]$Note,
  [string]$Theme,
  [string]$HeroImage,
  [string]$SceneTwoImage,
  [string]$SceneThreeImage,
  [string]$SceneFourImage,
  [string]$GalleryImages,
  [string]$Audio,
  [string]$ProjectName = "for-youuu",
  [string]$AccountId = $env:CLOUDFLARE_ACCOUNT_ID,
  [string]$ApiToken = $env:CLOUDFLARE_API_TOKEN,
  [switch]$Deploy
)

$root = Split-Path -Parent $MyInvocation.MyCommand.Path
Set-Location $root

function Prompt-Value {
  param(
    [string]$Label,
    [string]$Current,
    [string]$Fallback = ""
  )

  if (-not [string]::IsNullOrWhiteSpace($Current)) {
    return $Current
  }

  $value = Read-Host $Label
  if (-not [string]::IsNullOrWhiteSpace($value)) {
    return $value
  }

  return $Fallback
}

function Resolve-ExistingPath {
  param([string]$PathValue)

  if ([string]::IsNullOrWhiteSpace($PathValue)) {
    return ""
  }

  return (Resolve-Path $PathValue).Path
}

function Copy-Asset {
  param(
    [string]$SourcePath,
    [string]$BaseName,
    [string]$AssetDirectory
  )

  if ([string]::IsNullOrWhiteSpace($SourcePath)) {
    return ""
  }

  $resolved = Resolve-ExistingPath $SourcePath
  $extension = [System.IO.Path]::GetExtension($resolved)
  $fileName = "$BaseName$extension"
  $destination = Join-Path $AssetDirectory $fileName
  Copy-Item $resolved -Destination $destination -Force
  return "story-assets/$fileName"
}

function Parse-GalleryPaths {
  param([string]$RawValue)

  if ([string]::IsNullOrWhiteSpace($RawValue)) {
    return @()
  }

  return $RawValue.Split(";") |
    ForEach-Object { $_.Trim() } |
    Where-Object { $_ } |
    Select-Object -First 3
}

$Name = Prompt-Value "Her name" $Name "beautiful one"
$From = Prompt-Value "Your name" $From "someone cheering for you"
$Opening = Prompt-Value "Hero opening" $Opening "This is not just a birthday page. It is a small world built to celebrate you."
$Note = Prompt-Value "Birthday note" $Note "I hope this year feels gentle, bright, and deeply yours."
$Theme = Prompt-Value "Theme (moonlit/blush/daybreak/starlit/rosewood/meadow)" $Theme "moonlit"
$HeroImage = Prompt-Value "Hero image path (optional)" $HeroImage
$legacyGalleryPaths = Parse-GalleryPaths $GalleryImages
$legacySceneTwo = if ($legacyGalleryPaths.Count -ge 1) { $legacyGalleryPaths[0] } else { "" }
$legacySceneThree = if ($legacyGalleryPaths.Count -ge 2) { $legacyGalleryPaths[1] } else { "" }
$legacySceneFour = if ($legacyGalleryPaths.Count -ge 3) { $legacyGalleryPaths[2] } else { "" }
$SceneTwoImage = Prompt-Value "Page 3 image path (optional)" $SceneTwoImage $legacySceneTwo
$SceneThreeImage = Prompt-Value "Page 4 image path (optional)" $SceneThreeImage $legacySceneThree
$SceneFourImage = Prompt-Value "Page 5 image path (optional)" $SceneFourImage $legacySceneFour
$Audio = Prompt-Value "Audio path (optional)" $Audio

$assetDir = Join-Path $root "story-assets"
New-Item -ItemType Directory -Path $assetDir -Force | Out-Null

$photoAsset = Copy-Asset $HeroImage "hero" $assetDir
$audioAsset = Copy-Asset $Audio "soundtrack" $assetDir
$sceneTwoAsset = Copy-Asset $SceneTwoImage "scene-two" $assetDir
$sceneThreeAsset = Copy-Asset $SceneThreeImage "scene-three" $assetDir
$sceneFourAsset = Copy-Asset $SceneFourImage "scene-four" $assetDir

$storyData = [ordered]@{
  name = $Name
  from = $From
  opening = $Opening
  note = $Note
  photo = $photoAsset
  audio = $audioAsset
  sceneTwoImage = $sceneTwoAsset
  sceneThreeImage = $sceneThreeAsset
  sceneFourImage = $sceneFourAsset
  gallery = ""
  theme = $Theme
}

$storyData | ConvertTo-Json -Depth 4 | Set-Content -Path (Join-Path $root "story-data.json") -Encoding UTF8

$deployDir = Join-Path $root ".deploy-pages"
Remove-Item $deployDir -Recurse -Force -ErrorAction SilentlyContinue
New-Item -ItemType Directory -Path $deployDir -Force | Out-Null
Copy-Item index.html, styles.css, script.js, story-data.json, _headers -Destination $deployDir -Force
Copy-Item $assetDir -Destination (Join-Path $deployDir "story-assets") -Recurse -Force
if (Test-Path (Join-Path $root "functions")) {
  Copy-Item (Join-Path $root "functions") -Destination (Join-Path $deployDir "functions") -Recurse -Force
}

Write-Host ""
Write-Host "Prepared story-data.json and .deploy-pages with your local assets."
Write-Host "Receiver-visible page images are now inside story-assets/."

if ($Deploy) {
  if ([string]::IsNullOrWhiteSpace($ApiToken)) {
    $ApiToken = Read-Host "Cloudflare API token"
  }

  if ([string]::IsNullOrWhiteSpace($AccountId)) {
    $AccountId = Read-Host "Cloudflare account ID"
  }

  $env:CLOUDFLARE_API_TOKEN = $ApiToken
  $env:CLOUDFLARE_ACCOUNT_ID = $AccountId

  Write-Host ""
  Write-Host "Deploying to Cloudflare Pages..."
  npx.cmd wrangler pages deploy .deploy-pages --project-name $ProjectName --branch main
}
