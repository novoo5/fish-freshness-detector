import { NextResponse } from 'next/server';

export async function POST(request) {
    try {
        const formData = await request.formData();
        const imageFile = formData.get('image');

        if (!imageFile) {
            return NextResponse.json({ error: 'No image provided' }, { status: 400 });
        }

        const bytes = await imageFile.arrayBuffer();
        const buffer = Buffer.from(bytes);
        const base64Image = buffer.toString('base64');

        const ROBOFLOW_API_KEY = process.env.ROBOFLOW_API_KEY;

        if (!ROBOFLOW_API_KEY) {
            return NextResponse.json({ error: 'API key not configured' }, { status: 500 });
        }

        const response = await fetch(
            `https://detect.roboflow.com/fish-fresh-and-non-fresh/1?api_key=${ROBOFLOW_API_KEY}&confidence=40`,
            {
                method: 'POST',
                headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                body: base64Image,
            }
        );

        if (!response.ok) throw new Error('Roboflow API error');

        const result = await response.json();
        const prediction = result.predictions?.[0];

        if (!prediction) {
            return NextResponse.json({ error: 'No fish detected' }, { status: 400 });
        }

        const isFresh = prediction.class === 'Fresh Fish';
        const confidence = prediction.confidence;

        return NextResponse.json({
            isFresh,
            confidence,
            ...generateBiologicalIndicators(isFresh, confidence),
        });
    } catch (error) {
        console.error('Analysis error:', error);
        return NextResponse.json({ error: 'Analysis failed' }, { status: 500 });
    }
}

function generateBiologicalIndicators(isFresh, confidence) {
    if (isFresh) {
        return {
            eyeClarity: parseFloat(Math.min(10, 8.5 + confidence * 1.5).toFixed(1)),
            corneaTransparency: parseInt(Math.min(100, 85 + confidence * 10).toFixed(0)),
            pupilColor: 'Deep Black',
            eyeShape: 'Bulging',
            estimatedTVBN: parseInt(Math.max(5, 15 - confidence * 10).toFixed(0)),
            sniScore: Math.min(9, Math.round(6 + confidence * 3)),
        };
    } else {
        return {
            eyeClarity: parseFloat(Math.max(1, 2 + confidence * 2).toFixed(1)),
            corneaTransparency: parseInt(Math.max(10, 20 + confidence * 25).toFixed(0)),
            pupilColor: 'Gray/Pale',
            eyeShape: 'Sunken',
            estimatedTVBN: parseInt(Math.min(80, 25 + confidence * 40).toFixed(0)),
            sniScore: Math.max(1, Math.round(3 - confidence * 1)),
        };
    }
}
