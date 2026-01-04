'use client'

import React from 'react'
import { Editor } from '@tinymce/tinymce-react'

interface TinyEditorProps {
    value: string
    onChange: (content: string) => void
}

export default function TinyEditor({ value, onChange }: TinyEditorProps) {
    return (
        <Editor
            apiKey={process.env.NEXT_PUBLIC_TINYMCE_API_KEY}
            value={value}
            init={{
                height: 500,
                menubar: 'file edit view insert format tools table help',
                plugins: [
                    'advlist', 'autolink', 'lists', 'link', 'image', 'charmap',
                    'preview', 'anchor', 'searchreplace', 'visualblocks', 'code',
                    'fullscreen', 'insertdatetime', 'media', 'table', 'help', 'wordcount'
                ],
                toolbar:
                    'undo redo | blocks | bold italic underline forecolor | ' +
                    'alignleft aligncenter alignright alignjustify | bullist numlist outdent indent | ' +
                    'link image media table | removeformat | fullscreen preview code',
                content_style: `
          body { font-family:Helvetica,Arial,sans-serif; font-size:14px }
          img { max-width: 100%; height: auto; }
        `,
                language: 'vi',

                /* --- Bật chức năng upload ảnh nội bộ --- */
                images_upload_handler: async (blobInfo: any, progress: any) => {
                    // 1️⃣ Cách đơn giản: chuyển ảnh thành base64 (dễ dùng, không cần backend)
                    return new Promise((resolve) => {
                        const base64 = 'data:' + blobInfo.blob().type + ';base64,' + blobInfo.base64()
                        resolve(base64)
                    })

                    // 👉 Nếu bạn có API upload ảnh, dùng cách này:
                    // const formData = new FormData()
                    // formData.append('file', blobInfo.blob(), blobInfo.filename())
                    // const res = await fetch('/api/upload', { method: 'POST', body: formData })
                    // const json = await res.json()
                    // return json.url // trả về URL ảnh
                },
            }}
            onEditorChange={onChange}
        />
    )
}
