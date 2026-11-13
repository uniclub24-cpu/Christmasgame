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

    // hub = 4개 게임 묶음 앱(com.peli.hub · 랜딩에서 게임 고르기) / tree · catch = 게임 하나짜리 앱
    flavorDimensions += "game"
    productFlavors {
        create("hub") { dimension = "game"; applicationId = "com.peli.hub" }
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
