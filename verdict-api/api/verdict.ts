import Anthropic from '@anthropic-ai/sdk';

interface VerdictRequest {
  address: string;
  buildingStatus: {
    level: string;
    label: string;
    openClassA: number;
    openClassB: number;
    openClassC: number;
    totalViolations: number;
    resolvedViolations: number;
  };
  landlord: {
    name: string;
    grade: string;
    buildings: number;
    units: number;
    violationRate: number;
  } | null;
  seasonal: {
    winterHeatIssues: number;
    summerNoiseIssues: number;
    spikeMonths: string[];
  };
  neighborhood: {
    name: string;
    composite: number;
    safety: number;
    cleanliness: number;
    noise: number;
    foodSafety: number;
    greenSpace: number;
    transit: number;
  } | null;
}

interface VerdictResponse {
  verdict: 'GREEN_LIGHT' | 'PROCEED_WITH_CAUTION' | 'RED_FLAG' | 'NEEDS_INVESTIGATION';
  summary: string;
  findings: string[];
  questions: string[];
  recommendation: string;
}

function buildPrompt(req: VerdictRequest): string {
  const lines: string[] = [
    `Analyze this NYC rental apartment at ${req.address} for a prospective tenant.`,
    '',
    '## Building Status',
    `- Level: ${req.buildingStatus.level} (${req.buildingStatus.label})`,
    `- Open violations: Class A=${req.buildingStatus.openClassA}, Class B=${req.buildingStatus.openClassB}, Class C=${req.buildingStatus.openClassC}`,
    `- Total violations: ${req.buildingStatus.totalViolations} (${req.buildingStatus.resolvedViolations} resolved)`,
  ];

  if (req.landlord) {
    lines.push(
      '',
      '## Landlord',
      `- Name: ${req.landlord.name}`,
      `- Grade: ${req.landlord.grade}`,
      `- Portfolio: ${req.landlord.buildings} buildings, ${req.landlord.units} units`,
      `- Violation rate: ${(req.landlord.violationRate * 100).toFixed(1)}% (citywide median ~15%)`,
    );
  }

  lines.push(
    '',
    '## Seasonal Patterns',
    `- Winter heat issues: ${req.seasonal.winterHeatIssues}`,
    `- Summer noise issues: ${req.seasonal.summerNoiseIssues}`,
    `- Spike months: ${req.seasonal.spikeMonths.length > 0 ? req.seasonal.spikeMonths.join(', ') : 'none'}`,
  );

  if (req.neighborhood) {
    lines.push(
      '',
      '## Neighborhood',
      `- ${req.neighborhood.name}: composite ${req.neighborhood.composite}/100`,
      `- Safety: ${req.neighborhood.safety}, Cleanliness: ${req.neighborhood.cleanliness}, Noise: ${req.neighborhood.noise}`,
      `- Food Safety: ${req.neighborhood.foodSafety}, Green Space: ${req.neighborhood.greenSpace}, Transit: ${req.neighborhood.transit}`,
    );
  }

  lines.push(
    '',
    'Respond with ONLY a JSON object (no markdown, no code fences) matching this structure:',
    '{',
    '  "verdict": "GREEN_LIGHT" | "PROCEED_WITH_CAUTION" | "RED_FLAG" | "NEEDS_INVESTIGATION",',
    '  "summary": "2-3 sentence overall assessment",',
    '  "findings": ["finding 1", "finding 2", ...],',
    '  "questions": ["question to ask landlord 1", ...],',
    '  "recommendation": "1-2 sentence actionable advice"',
    '}',
  );

  return lines.join('\n');
}

function validateRequest(body: unknown): body is VerdictRequest {
  if (!body || typeof body !== 'object') return false;
  const b = body as Record<string, unknown>;
  return (
    typeof b['address'] === 'string' &&
    typeof b['buildingStatus'] === 'object' &&
    b['buildingStatus'] !== null &&
    typeof b['seasonal'] === 'object' &&
    b['seasonal'] !== null
  );
}

export default async function handler(req: Request): Promise<Response> {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 204 });
  }

  if (req.method !== 'POST') {
    return Response.json({ error: 'Method not allowed' }, { status: 405 });
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return Response.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  if (!validateRequest(body)) {
    return Response.json({ error: 'Invalid request body' }, { status: 400 });
  }

  const apiKey = process.env['ANTHROPIC_API_KEY'];
  if (!apiKey) {
    return Response.json(
      { error: 'AI analysis not configured' },
      { status: 503 },
    );
  }

  try {
    const client = new Anthropic({ apiKey });
    const prompt = buildPrompt(body);

    const message = await client.messages.create({
      model: 'claude-sonnet-4-5-20250929',
      max_tokens: 1024,
      messages: [
        {
          role: 'user',
          content: prompt,
        },
      ],
      system:
        'You are a NYC real estate analyst. Provide honest, data-driven assessments to help renters make informed decisions. Be direct but fair. Always respond with valid JSON only.',
    });

    const textBlock = message.content.find((b) => b.type === 'text');
    if (!textBlock || textBlock.type !== 'text') {
      return Response.json(
        { error: 'No response from AI' },
        { status: 500 },
      );
    }

    const verdict = JSON.parse(textBlock.text) as VerdictResponse;
    return Response.json(verdict);
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'AI analysis failed';
    return Response.json({ error: msg }, { status: 500 });
  }
}
