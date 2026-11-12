plugins {
    id("com.android.application")
    id("org.jetbrains.kotlin.android")
}

android {
    namespace = "com.peli.spotdiff"
    compileSdk = 35

    defaultConfig {
        applicationId = "com.peli.tree"
        minSdk = 24
        targetSdk = 35
        versionCode = 1
        versionName = "1.0.0"
    }

    // 같은 소스로 앱 2개: 페리 크리스마스(com.peli.tree) · 떨어지는 선물 받기(com.peli.catch) — 태블릿에 따로 설치·플로팅
    flavorDimensions += "game"
    productFlavors {
        create("tree") { dimension = "game"; applicationId = "com.peli.tree" }
        create("catch") { dimension = "game"; applicationId = "com.peli.catch" }
    }

    buildTypes {
        release {
            isMinifyEnabled = false
            // 테스트 배포용: 디버그 키로 서명 (스토어 배포 시 본인 키로 교체)
            signingConfig = signingConfigs.getByName("debug")
        }
    }
    compileOptions {
        sourceCompatibility = JavaVersion.VERSION_17
        targetCompatibility = JavaVersion.VERSION_17
    }
    kotlinOptions { jvmTarget = "17" }
}

dependencies {
    implementation("androidx.webkit:webkit:1.12.1")
}
