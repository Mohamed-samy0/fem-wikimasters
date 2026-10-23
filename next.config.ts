import { dirname } from "node:path";
import type { NextConfig } from "next";

const nextConfig: NextConfig = {

	images: {
		localPatterns: [
			{
				pathname: "/api/blob/**",
			},
		],
		remotePatterns: [
			{
				protocol: "https",
				hostname: "**",
			},
		],
	},
	turbopack: {
		root: dirname(__filename),
		rules: {
			"*.css": {
				loaders: ["@tailwindcss/turbopack"],
				as: "*.css",
			},
		},
	},
};

export default nextConfig;
