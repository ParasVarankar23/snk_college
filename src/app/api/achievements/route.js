import { deleteCloudinaryImage, uploadBufferToCloudinary } from "@/lib/cloudinary";
import { getAdminDb } from "@/lib/firebaseAdmin";

const ALLOWED_CATEGORIES = new Set(["academic", "awards", "sports"]);

function normalizeCategory(value) {
	return String(value || "").trim().toLowerCase();
}

function normalizeSearch(value) {
	return String(value || "").trim().toLowerCase();
}

function toAchievementPayload(record) {
	return {
		id: record?.id,
		title: record?.title || "",
		description: record?.description || "",
		category: record?.category || "",
		imageUrl: record?.imageUrl || "",
		imagePublicId: record?.imagePublicId || "",
		createdAt: record?.createdAt || "",
		updatedAt: record?.updatedAt || "",
	};
}

function matchesSearch(achievement, search) {
	if (!search) return true;

	return [achievement.title, achievement.description, achievement.category]
		.join(" ")
		.toLowerCase()
		.includes(search);
}

export async function GET(request) {
	try {
		const { searchParams } = new URL(request.url);
		const category = normalizeCategory(searchParams.get("category"));
		const search = normalizeSearch(searchParams.get("search"));

		if (category && !ALLOWED_CATEGORIES.has(category)) {
			return Response.json(
				{ error: "Invalid category. Use academic, awards, or sports." },
				{ status: 400 }
			);
		}

		const db = getAdminDb();
		const snapshot = await db.ref("achievements_items").get();

		if (!snapshot.exists()) {
			return Response.json({ success: true, achievements: [] }, { status: 200 });
		}

		const achievementsMap = snapshot.val() || {};
		const achievements = Object.entries(achievementsMap)
			.map(([id, value]) => toAchievementPayload({ id, ...value }))
			.filter((achievement) => !category || achievement.category === category)
			.filter((achievement) => matchesSearch(achievement, search))
			.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

		return Response.json({ success: true, achievements }, { status: 200 });
	} catch (error) {
		console.error("Achievements GET error:", error);
		return Response.json(
			{ error: "Failed to fetch achievements" },
			{ status: 500 }
		);
	}
}

export async function POST(request) {
	try {
		const formData = await request.formData();

		const title = String(formData.get("title") || "").trim();
		const description = String(formData.get("description") || "").trim();
		const category = normalizeCategory(formData.get("category"));
		const imageFile = formData.get("image");

		if (!title || !description || !category || !imageFile) {
			return Response.json(
				{ error: "Title, description, category, and image are required" },
				{ status: 400 }
			);
		}

		if (!ALLOWED_CATEGORIES.has(category)) {
			return Response.json(
				{ error: "Invalid category. Use academic, awards, or sports." },
				{ status: 400 }
			);
		}

		if (!imageFile.type?.startsWith("image/")) {
			return Response.json(
				{ error: "Only image files are allowed" },
				{ status: 400 }
			);
		}

		const buffer = Buffer.from(await imageFile.arrayBuffer());
		const uploadResult = await uploadBufferToCloudinary(buffer, `college/achievements/${category}`);

		const db = getAdminDb();
		const newRef = db.ref("achievements_items").push();
		const createdAt = new Date().toISOString();

		const achievement = {
			title,
			description,
			category,
			imageUrl: uploadResult.secure_url,
			imagePublicId: uploadResult.public_id,
			createdAt,
		};

		await newRef.set(achievement);

		return Response.json(
			{
				success: true,
				message: "Achievement added successfully",
				achievement: toAchievementPayload({ id: newRef.key, ...achievement }),
			},
			{ status: 201 }
		);
	} catch (error) {
		console.error("Achievements POST error:", error);
		return Response.json(
			{ error: error.message || "Failed to add achievement" },
			{ status: 500 }
		);
	}
}

export async function PUT(request) {
	try {
		const formData = await request.formData();

		const id = String(formData.get("id") || "").trim();
		const title = String(formData.get("title") || "").trim();
		const description = String(formData.get("description") || "").trim();
		const category = normalizeCategory(formData.get("category"));
		const imageFile = formData.get("image");

		if (!id || !title || !description || !category) {
			return Response.json(
				{ error: "ID, title, description, and category are required" },
				{ status: 400 }
			);
		}

		if (!ALLOWED_CATEGORIES.has(category)) {
			return Response.json(
				{ error: "Invalid category. Use academic, awards, or sports." },
				{ status: 400 }
			);
		}

		const db = getAdminDb();
		const achievementRef = db.ref(`achievements_items/${id}`);
		const snapshot = await achievementRef.get();

		if (!snapshot.exists()) {
			return Response.json({ error: "Achievement not found" }, { status: 404 });
		}

		const existing = snapshot.val() || {};
		let imageUrl = existing.imageUrl || "";
		let imagePublicId = existing.imagePublicId || "";

		if (imageFile && imageFile.size > 0) {
			if (!imageFile.type?.startsWith("image/")) {
				return Response.json(
					{ error: "Only image files are allowed" },
					{ status: 400 }
				);
			}

			const buffer = Buffer.from(await imageFile.arrayBuffer());
			const uploadResult = await uploadBufferToCloudinary(buffer, `college/achievements/${category}`);

			if (existing.imagePublicId) {
				await deleteCloudinaryImage(existing.imagePublicId);
			}

			imageUrl = uploadResult.secure_url;
			imagePublicId = uploadResult.public_id;
		}

		const updatedAchievement = {
			...existing,
			title,
			description,
			category,
			imageUrl,
			imagePublicId,
			updatedAt: new Date().toISOString(),
		};

		await achievementRef.set(updatedAchievement);

		return Response.json(
			{
				success: true,
				message: "Achievement updated successfully",
				achievement: toAchievementPayload({ id, ...updatedAchievement }),
			},
			{ status: 200 }
		);
	} catch (error) {
		console.error("Achievements PUT error:", error);
		return Response.json(
			{ error: error.message || "Failed to update achievement" },
			{ status: 500 }
		);
	}
}

export async function DELETE(request) {
	try {
		const { searchParams } = new URL(request.url);
		const id = String(searchParams.get("id") || "").trim();

		if (!id) {
			return Response.json({ error: "Achievement ID is required" }, { status: 400 });
		}

		const db = getAdminDb();
		const achievementRef = db.ref(`achievements_items/${id}`);
		const snapshot = await achievementRef.get();

		if (!snapshot.exists()) {
			return Response.json({ error: "Achievement not found" }, { status: 404 });
		}

		const achievement = snapshot.val() || {};

		if (achievement.imagePublicId) {
			await deleteCloudinaryImage(achievement.imagePublicId);
		}

		await achievementRef.remove();

		return Response.json(
			{ success: true, message: "Achievement permanently deleted" },
			{ status: 200 }
		);
	} catch (error) {
		console.error("Achievements DELETE error:", error);
		return Response.json(
			{ error: error.message || "Failed to delete achievement" },
			{ status: 500 }
		);
	}
}
