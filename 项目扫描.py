#!/usr/bin/env python3
"""
项目文件路径扫描工具
支持过滤、排除特定文件/文件夹、输出到文件
"""

import os
import json
from pathlib import Path
from typing import List, Set, Optional
import argparse


class FileScanner:
    def __init__(
        self,
        root_path: str,
        exclude_dirs: Optional[Set[str]] = None,
        exclude_files: Optional[Set[str]] = None,
        include_extensions: Optional[Set[str]] = None,
        exclude_extensions: Optional[Set[str]] = None,
        max_depth: Optional[int] = None
    ):
        """
        初始化文件扫描器
        
        Args:
            root_path: 根目录路径
            exclude_dirs: 要排除的目录名集合
            exclude_files: 要排除的文件名集合
            include_extensions: 只包含的文件扩展名集合（如 {'.py', '.js'}）
            exclude_extensions: 要排除的文件扩展名集合
            max_depth: 最大扫描深度（None 为无限制）
        """
        self.root_path = Path(root_path).resolve()
        self.exclude_dirs = exclude_dirs or {
            'node_modules', '.git', '__pycache__', '.venv', 
            'venv', 'dist', 'build', '.idea', '.vscode'
        }
        self.exclude_files = exclude_files or {'.DS_Store', 'Thumbs.db'}
        self.include_extensions = include_extensions
        self.exclude_extensions = exclude_extensions or set()
        self.max_depth = max_depth
        
        self.files: List[Path] = []
        self.dirs: List[Path] = []
        
    def should_exclude_dir(self, dir_name: str) -> bool:
        """判断是否应该排除该目录"""
        return dir_name in self.exclude_dirs or dir_name.startswith('.')
    
    def should_include_file(self, file_path: Path) -> bool:
        """判断是否应该包含该文件"""
        # 检查文件名
        if file_path.name in self.exclude_files:
            return False
        
        # 检查扩展名
        ext = file_path.suffix.lower()
        
        if self.exclude_extensions and ext in self.exclude_extensions:
            return False
        
        if self.include_extensions and ext not in self.include_extensions:
            return False
        
        return True
    
    def scan(self) -> tuple[List[Path], List[Path]]:
        """
        执行扫描
        
        Returns:
            (文件列表, 目录列表)
        """
        self.files = []
        self.dirs = []
        
        self._scan_directory(self.root_path, 0)
        
        return self.files, self.dirs
    
    def _scan_directory(self, directory: Path, depth: int):
        """递归扫描目录"""
        if self.max_depth is not None and depth > self.max_depth:
            return
        
        try:
            for item in directory.iterdir():
                if item.is_dir():
                    if not self.should_exclude_dir(item.name):
                        self.dirs.append(item)
                        self._scan_directory(item, depth + 1)
                elif item.is_file():
                    if self.should_include_file(item):
                        self.files.append(item)
        except PermissionError:
            print(f"警告: 无权限访问 {directory}")
    
    def get_relative_paths(self) -> tuple[List[str], List[str]]:
        """获取相对于根目录的路径"""
        rel_files = [str(f.relative_to(self.root_path)) for f in self.files]
        rel_dirs = [str(d.relative_to(self.root_path)) for d in self.dirs]
        return rel_files, rel_dirs
    
    def print_tree(self, max_files: int = 1000):
        """打印文件树"""
        print(f"\n统计: {len(self.files)} 个文件, {len(self.dirs)} 个目录\n")
        
        # 构建完整的树状结构
        root_name = self.root_path.name
        print(f"{root_name}/")
        
        # 收集所有路径（目录和文件）
        all_paths = {}
        
        # 添加所有目录
        for dir_path in self.dirs:
            rel_path = dir_path.relative_to(self.root_path)
            all_paths[str(rel_path)] = {'type': 'dir', 'path': rel_path}
        
        # 添加所有文件
        for file_path in self.files:
            rel_path = file_path.relative_to(self.root_path)
            all_paths[str(rel_path)] = {'type': 'file', 'path': rel_path}
        
        # 按路径排序
        sorted_paths = sorted(all_paths.items(), key=lambda x: str(x[1]['path']))
        
        # 打印每个路径
        for path_str, info in sorted_paths:
            rel_path = info['path']
            depth = len(rel_path.parts)
            indent = "    " * depth
            
            if info['type'] == 'dir':
                print(f"{indent}{rel_path.name}/")
            else:
                print(f"{indent}{rel_path.name}")
    
    def save_to_file(self, output_path: str, format: str = 'txt'):
        """
        保存扫描结果到文件
        
        Args:
            output_path: 输出文件路径
            format: 输出格式 ('txt', 'json', 'markdown')
        """
        rel_files, rel_dirs = self.get_relative_paths()
        root_name = self.root_path.name
        
        if format == 'json':
            data = {
                'total_files': len(rel_files),
                'total_dirs': len(rel_dirs),
                'files': sorted(rel_files),
                'directories': sorted(rel_dirs)
            }
            with open(output_path, 'w', encoding='utf-8') as f:
                json.dump(data, f, indent=2, ensure_ascii=False)
        
        elif format == 'markdown' or format == 'txt':
            # 构建树状结构
            all_paths = {}
            
            for dir_path in self.dirs:
                rel_path = dir_path.relative_to(self.root_path)
                all_paths[str(rel_path)] = {'type': 'dir', 'path': rel_path}
            
            for file_path in self.files:
                rel_path = file_path.relative_to(self.root_path)
                all_paths[str(rel_path)] = {'type': 'file', 'path': rel_path}
            
            sorted_paths = sorted(all_paths.items(), key=lambda x: str(x[1]['path']))
            
            with open(output_path, 'w', encoding='utf-8') as f:
                if format == 'markdown':
                    f.write(f"# {root_name}\n\n")
                    f.write(f"**统计:** {len(rel_files)} 个文件, {len(rel_dirs)} 个目录\n\n")
                    f.write("```\n")
                else:
                    f.write(f"{root_name}\n")
                    f.write(f"{'=' * 60}\n")
                    f.write(f"文件总数: {len(rel_files)}\n")
                    f.write(f"目录总数: {len(rel_dirs)}\n")
                    f.write(f"{'=' * 60}\n\n")
                
                # 写入根目录
                f.write(f"{root_name}/\n")
                
                # 写入所有路径
                for path_str, info in sorted_paths:
                    rel_path = info['path']
                    depth = len(rel_path.parts)
                    indent = "    " * depth
                    
                    if info['type'] == 'dir':
                        f.write(f"{indent}{rel_path.name}/\n")
                    else:
                        f.write(f"{indent}{rel_path.name}\n")
                
                if format == 'markdown':
                    f.write("```\n")
        
        print(f"结果已保存到: {output_path}")


def main():
    parser = argparse.ArgumentParser(description='项目文件路径扫描工具')
    parser.add_argument('path', nargs='?', default='.', help='要扫描的目录路径（默认为当前目录）')
    parser.add_argument('-o', '--output', default='project_path_tree.md', help='输出文件路径（默认: project_path_tree.md）')
    parser.add_argument('-f', '--format', choices=['txt', 'json', 'markdown'], 
                       default='markdown', help='输出格式（默认: markdown）')
    parser.add_argument('-e', '--extensions', help='只包含的文件扩展名，用逗号分隔（如: .py,.js,.html）')
    parser.add_argument('-x', '--exclude-extensions', help='排除的文件扩展名，用逗号分隔')
    parser.add_argument('-d', '--max-depth', type=int, help='最大扫描深度')
    parser.add_argument('--exclude-dirs', help='额外排除的目录，用逗号分隔')
    parser.add_argument('--no-tree', action='store_true', help='不打印文件树')
    
    args = parser.parse_args()
    
    # 处理参数
    include_extensions = None
    if args.extensions:
        include_extensions = {ext.strip() if ext.startswith('.') else f'.{ext.strip()}' 
                            for ext in args.extensions.split(',') if ext.strip()}
    
    exclude_extensions = None
    if args.exclude_extensions:
        exclude_extensions = {ext.strip() if ext.startswith('.') else f'.{ext.strip()}' 
                            for ext in args.exclude_extensions.split(',') if ext.strip()}
    
    exclude_dirs = None
    if args.exclude_dirs:
        exclude_dirs = {d.strip() for d in args.exclude_dirs.split(',') if d.strip()}
    
    # 创建扫描器
    scanner = FileScanner(
        root_path=args.path,
        exclude_dirs=exclude_dirs,
        include_extensions=include_extensions,
        exclude_extensions=exclude_extensions,
        max_depth=args.max_depth
    )
    
    # 执行扫描
    print("开始扫描...")
    files, dirs = scanner.scan()
    
    # 打印结果
    if not args.no_tree:
        scanner.print_tree()
    
    # 保存到文件
    if args.output:
        scanner.save_to_file(args.output, args.format)
    else:
        print(f"\n扫描完成！找到 {len(files)} 个文件和 {len(dirs)} 个目录")


if __name__ == '__main__':
    main()