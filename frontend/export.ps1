$source = "c:\Users\WiN_10\Downloads\New folder\Provelt-Final-main-2\frontend"
$dest = "c:\Users\WiN_10\Downloads\New folder\Provelt-Final-main-2\frontend\homepage_export"
New-Item -ItemType Directory -Force -Path $dest
New-Item -ItemType Directory -Force -Path "$dest\src\pages"
New-Item -ItemType Directory -Force -Path "$dest\src\components"
New-Item -ItemType Directory -Force -Path "$dest\src\context"
New-Item -ItemType Directory -Force -Path "$dest\src\lib"

Copy-Item -Path "$source\src\pages\HomePage.jsx" -Destination "$dest\src\pages\"
Copy-Item -Path "$source\src\components\*" -Destination "$dest\src\components\" -Recurse
Copy-Item -Path "$source\src\context\LanguageContext.jsx" -Destination "$dest\src\context\"
Copy-Item -Path "$source\src\lib\translations.js" -Destination "$dest\src\lib\"
Copy-Item -Path "$source\src\index.css" -Destination "$dest\src\"
Copy-Item -Path "$source\package.json" -Destination "$dest\"
Copy-Item -Path "$source\vite.config.js" -Destination "$dest\"

Compress-Archive -Path "$dest\*" -DestinationPath "$source\homepage_export.zip" -Force
Remove-Item -Path $dest -Recurse -Force
