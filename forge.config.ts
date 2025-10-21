import { MakerSquirrel } from '@electron-forge/maker-squirrel';
import { VitePlugin } from '@electron-forge/plugin-vite';
import { AutoUnpackNativesPlugin } from '@electron-forge/plugin-auto-unpack-natives';
import type { ForgeConfig } from '@electron-forge/shared-types';

const config: ForgeConfig = {
    packagerConfig: {
        asar: {
            unpack: '*.{node,dll}',
            unpackDir: '{**/onnxruntime-node/**,**/sharp/**}'
        },
        ignore: [/node_modules\/onnxruntime-node\/bin\/napi-v6\/win32\/arm64/],
        icon: './src/assets/images/favicon',
        name: 'z-register',
        appBundleId: 'com.ovfteam.z-register',
        extraResource: ['rektCaptcha', 'models'],
        win32metadata: {
            CompanyName: 'ovfteam',
            FileDescription: 'tele: @ovftank',
            OriginalFilename: 'z-register.exe',
            ProductName: 'z-register',
            InternalName: 'z-register'
        }
    },
    rebuildConfig: {
        force: true
    },
    makers: [
        new MakerSquirrel(
            (arch) => {
                if (arch !== 'x64') {
                    throw new Error(`Only x64 builds are supported, attempted to build for ${arch}`);
                }
                return {
                    name: 'Z-REGISTER',
                    setupIcon: './src/assets/images/favicon.ico',
                    iconUrl: 'https://ovfteam.com/favicon.ico',
                    authors: 'ovftank',
                    description: 'tele: @ovftank',
                    exe: 'z-register.exe'
                };
            },
            ['win32']
        )
    ],
    plugins: [
        new AutoUnpackNativesPlugin({}),
        new VitePlugin({
            build: [
                {
                    entry: 'src/main.ts',
                    config: 'vite.main.config.mts',
                    target: 'main'
                },
                {
                    entry: 'src/preload.ts',
                    config: 'vite.preload.config.mts',
                    target: 'preload'
                }
            ],
            renderer: [
                {
                    name: 'main_window',
                    config: 'vite.renderer.config.mts'
                }
            ]
        })
    ],
    outDir: 'out'
};

export default config;
