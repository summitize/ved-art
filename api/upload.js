const getRepositoryInfo = () => {
  const repository = process.env.GITHUB_REPOSITORY;
  if (repository) {
    const [owner, repo] = repository.split("/");
    if (owner && repo) {
      return { owner, repo };
    }
  }

  const owner = process.env.GITHUB_OWNER;
  const repo = process.env.GITHUB_REPO;
  if (owner && repo) {
    return { owner, repo };
  }

  return null;
};

const getCommitBranch = () => process.env.GITHUB_BRANCH || "main";

const jsonResponse = (res, status, payload) => {
  res.statusCode = status;
  res.setHeader("Content-Type", "application/json");
  res.end(JSON.stringify(payload));
};

const getGithubHeaders = (token) => ({
  Authorization: `Bearer ${token}`,
  Accept: "application/vnd.github+json",
  "User-Agent": "VedArt CMS"
});

const getFileSha = async ({ owner, repo, path, token }) => {
  const url = `https://api.github.com/repos/${owner}/${repo}/contents/${encodeURIComponent(path)}`;
  const response = await fetch(url, {
    method: "GET",
    headers: getGithubHeaders(token)
  });

  if (response.status === 404) {
    return null;
  }

  if (!response.ok) {
    const body = await response.text();
    throw new Error(`Unable to read existing file: ${body}`);
  }

  const body = await response.json();
  return body.sha;
};

const handler = async (req, res) => {
  const githubToken = process.env.GITHUB_TOKEN;
  if (!githubToken) {
    return jsonResponse(res, 500, { error: "GITHUB_TOKEN is not configured in environment." });
  }

  const repoInfo = getRepositoryInfo();
  if (!repoInfo) {
    return jsonResponse(res, 500, {
      error: "GITHUB_REPOSITORY or GITHUB_OWNER/GITHUB_REPO must be configured in environment."
    });
  }

  const branch = getCommitBranch();

  if (req.method === "POST") {
    const body = req.body;
    const paintingId = Number(body?.paintingId);
    const fileName = String(body?.fileName || "");
    const contentType = String(body?.contentType || "image/jpeg");
    const base64Data = String(body?.base64Data || "");

    if (!Number.isFinite(paintingId) || paintingId < 1) {
      return jsonResponse(res, 400, { error: "paintingId is required and must be a number." });
    }

    if (!base64Data) {
      return jsonResponse(res, 400, { error: "base64Data is required." });
    }

    if (!contentType.startsWith("image/")) {
      return jsonResponse(res, 400, { error: "contentType must be an image MIME type." });
    }

    const filePath = `arts/page_${paintingId}.jpg`;
    let sha = null;

    try {
      sha = await getFileSha({ owner: repoInfo.owner, repo: repoInfo.repo, path: filePath, token: githubToken });
    } catch (error) {
      console.error(error);
      return jsonResponse(res, 502, { error: "Unable to read existing file from GitHub." });
    }

    const commitBody = {
      message: `Ved Art CMS upload: ${filePath}`,
      content: base64Data,
      branch,
      committer: {
        name: "Ved Art CMS",
        email: "no-reply@vedart.app"
      },
      author: {
        name: "Ved Art CMS",
        email: "no-reply@vedart.app"
      }
    };

    if (sha) {
      commitBody.sha = sha;
    }

    const url = `https://api.github.com/repos/${repoInfo.owner}/${repoInfo.repo}/contents/${encodeURIComponent(filePath)}`;
    const response = await fetch(url, {
      method: "PUT",
      headers: getGithubHeaders(githubToken),
      body: JSON.stringify(commitBody)
    });

    const result = await response.json();
    if (!response.ok) {
      const error = result?.message || "GitHub upload failed.";
      return jsonResponse(res, response.status, { error });
    }

    return jsonResponse(res, {
      ok: true,
      path: result.content?.path,
      download_url: result.content?.download_url
    });
  }

  if (req.method === "DELETE") {
    const body = req.body;
    const paintingId = Number(body?.paintingId);

    if (!Number.isFinite(paintingId) || paintingId < 1) {
      return jsonResponse(res, 400, { error: "paintingId is required and must be a number." });
    }

    const filePath = `arts/page_${paintingId}.jpg`;
    let sha;

    try {
      sha = await getFileSha({ owner: repoInfo.owner, repo: repoInfo.repo, path: filePath, token: githubToken });
      if (!sha) {
        return jsonResponse(res, 404, { error: "No existing custom image to remove." });
      }
    } catch (error) {
      console.error(error);
      return jsonResponse(res, 502, { error: "Unable to read existing file from GitHub." });
    }

    const deleteBody = {
      message: `Ved Art CMS remove custom image: ${filePath}`,
      sha,
      branch,
      committer: {
        name: "Ved Art CMS",
        email: "no-reply@vedart.app"
      },
      author: {
        name: "Ved Art CMS",
        email: "no-reply@vedart.app"
      }
    };

    const response = await fetch(`https://api.github.com/repos/${repoInfo.owner}/${repoInfo.repo}/contents/${encodeURIComponent(filePath)}`, {
      method: "PUT",
      headers: getGithubHeaders(githubToken),
      body: JSON.stringify(commitBody)
    });

    const result = await response.json();
    if (!response.ok) {
      const error = result?.message || "GitHub upload failed.";
      return jsonResponse(res, response.status, { error });
    }

    return jsonResponse(res, {
      ok: true,
      path: result.content?.path,
      download_url: result.content?.download_url
    });
  }

  res.setHeader("Allow", "POST");
  return jsonResponse(res, 405, { error: "Method not allowed." });
};

module.exports = handler;
